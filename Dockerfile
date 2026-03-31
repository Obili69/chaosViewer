# ── Builder ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production=false

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3039
ENV HOSTNAME=0.0.0.0

# Next.js standalone output (includes @prisma/client + runtime node_modules)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema for db push at startup
COPY --from=builder /app/prisma ./prisma

# Install Prisma CLI globally so all transitive deps are resolved correctly
RUN npm install -g prisma@5.22.0

# Admin creation script (bcryptjs + @prisma/client already in standalone node_modules)
COPY --from=builder /app/scripts ./scripts

# Persistent data directories (overridden by volume mounts at runtime)
RUN mkdir -p /app/data /app/uploads

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3039

ENTRYPOINT ["./docker-entrypoint.sh"]
