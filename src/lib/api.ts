import { API_BASE_URL } from "../config/api";

function joinUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!base) return path;
  if (base.endsWith("/") && path.startsWith("/")) return base + path.slice(1);
  if (!base.endsWith("/") && !path.startsWith("/")) return `${base}/${path}`;
  return base + path;
}

function buildUrl(path: string): string {
  return joinUrl(API_BASE_URL, path);
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiError = Error & { status?: number; data?: unknown };

const DEFAULT_TIMEOUT_MS = 12_000;

function toApiError(e: unknown, status?: number, data?: unknown): ApiError {
  const err = e instanceof Error ? e : new Error(String(e));
  (err as ApiError).status = status;
  (err as ApiError).data = data;
  return err as ApiError;
}

async function parseBody<T>(res: Response): Promise<T | undefined> {
  if (res.status === 204) return undefined;
  const ct = res.headers.get("content-type") || "";
  const text = await res.text(); // leggiamo una sola volta
  if (!text) return undefined as any;
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Invalid JSON from ${res.url}`);
    }
  }
  // fallback: string
  return text as any as T;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const url = buildUrl(path);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      credentials: "include",
      signal: ctrl.signal,
      headers:
        body != null
          ? { "content-type": "application/json" }
          : undefined,
      body: body != null ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      // prova a leggere un body di errore
      let data: unknown = undefined;
      try {
        data = await parseBody(res);
      } catch {
        /* ignore parse error on error path */
      }
      const message =
        (typeof data === "object" && data && "message" in data && typeof (data as any).message === "string"
          ? (data as any).message
          : undefined) || `HTTP ${res.status} ${res.statusText}`;
      throw toApiError(new Error(message), res.status, data);
    }

    return (await parseBody<T>(res)) as T;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw toApiError(new Error(`Request timeout after ${timeoutMs}ms`));
    }
    throw toApiError(e);
  } finally {
    clearTimeout(t);
  }
}

export const apiGET = <T>(path: string, timeoutMs?: number) =>
  request<T>("GET", path, undefined, timeoutMs);
export const apiPOST = <T>(path: string, body?: unknown, timeoutMs?: number) =>
  request<T>("POST", path, body, timeoutMs);
export const apiPUT = <T>(path: string, body?: unknown, timeoutMs?: number) =>
  request<T>("PUT", path, body, timeoutMs);
export const apiPATCH = <T>(path: string, body?: unknown, timeoutMs?: number) =>
  request<T>("PATCH", path, body, timeoutMs);
export const apiDELETE = <T>(path: string, timeoutMs?: number) =>
  request<T>("DELETE", path, undefined, timeoutMs);

// Helper comodo per POST/PUT che ritornano 204
export const apiPOSTNoContent = (path: string, body?: unknown, timeoutMs?: number) =>
  request<void>("POST", path, body, timeoutMs);
export const apiPUTNoContent = (path: string, body?: unknown, timeoutMs?: number) =>
  request<void>("PUT", path, body, timeoutMs);
export async function apiUPLOAD<T>(path: string, form: FormData, timeoutMs: number = 12_000): Promise<T> {
  const url = (function joinUrl(base: string, p: string) {
    if (/^https?:\/\//i.test(p)) return p;
    if (!base) return p;
    if (base.endsWith("/") && p.startsWith("/")) return base + p.slice(1);
    if (!base.endsWith("/") && !p.startsWith("/")) return `${base}/${p}`;
    return base + p;
  })((import.meta as any).env?.VITE_API_URL || (globalThis as any)?.process?.env?.VITE_API_URL || "/api", path);

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "POST", credentials: "include", signal: ctrl.signal, body: form });
    if (!res.ok) {
      let message = `HTTP ${res.status} ${res.statusText}`;
      try { const j = await res.json(); if (j?.message) message = j.message; } catch {}
      throw new Error(message);
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return (await res.json()) as T;
    return (await res.text()) as any as T;
  } finally {
    clearTimeout(t);
  }
}
