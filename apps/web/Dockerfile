# Build context: repository root (monorepo). Railway: RAILWAY_DOCKERFILE_PATH=apps/web/Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci --workspace @lasan/web --workspace @lasan/shared --include-workspace-root --no-audit --no-fund
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace @lasan/web
ENV NODE_ENV=production
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npx", "next", "start"]
