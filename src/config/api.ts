export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (typeof globalThis !== "undefined" && typeof (globalThis as any).process !== "undefined"
    ? (globalThis as any).process.env?.VITE_API_URL
    : "") ||
  "/api";