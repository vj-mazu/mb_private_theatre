# Movie Bash — production image (Next.js standalone + auto database setup)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are baked in at build time (ticket links, sitemap, SEO), so pass them in as build args.
ARG NEXT_PUBLIC_APP_URL=https://moviebash.in
ARG NEXT_PUBLIC_BUSINESS_PHONE=+919902923656
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT=standalone NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL NEXT_PUBLIC_BUSINESS_PHONE=$NEXT_PUBLIC_BUSINESS_PHONE
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/db ./db
COPY --from=build --chown=app:app /app/scripts ./scripts
# Scripts need these at runtime (the standalone bundle only traces what the app imports).
COPY --from=deps --chown=app:app /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=deps --chown=app:app /app/node_modules/pg ./node_modules/pg
RUN mkdir -p /app/backups && chown app:app /app/backups
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
# Creates/updates tables and the first admin automatically, then starts the site.
CMD ["sh", "-c", "node scripts/db-setup.js && node server.js"]
