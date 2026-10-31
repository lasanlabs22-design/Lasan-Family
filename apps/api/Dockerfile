# Build context: repository root (monorepo). Railway: RAILWAY_DOCKERFILE_PATH=apps/api/Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci --workspace @lasan/api --workspace @lasan/shared --include-workspace-root --no-audit --no-fund
RUN npm run build --workspace @lasan/api

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/drizzle ./apps/api/drizzle
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/index.js"]
