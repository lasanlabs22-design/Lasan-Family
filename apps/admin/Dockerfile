# Build context: repository root (monorepo). Railway: RAILWAY_DOCKERFILE_PATH=apps/admin/Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci --workspace @lasan/admin --workspace @lasan/shared --include-workspace-root --no-audit --no-fund
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace @lasan/admin
ENV NODE_ENV=production
WORKDIR /app/apps/admin
EXPOSE 3001
CMD ["npx", "next", "start"]
