FROM node:20-alpine
WORKDIR /app

COPY WeKnow-Admin/package.json WeKnow-Admin/package-lock.json* ./
RUN npm ci

COPY WeKnow-Admin/. .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]