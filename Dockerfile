# ─────────────────────────────────────────────
# Stage 1: Build Next.js frontend
# ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY client/package.json client/package-lock.json* ./
RUN npm ci

COPY client/ .

# /api relative path works because nginx routes it on the same domain
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Final single image
# ─────────────────────────────────────────────
FROM python:3.12-slim

# Install Node.js, nginx, and image libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    nginx \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── Django backend ──
WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# ── Next.js frontend (standalone build) ──
COPY --from=frontend-builder /frontend/.next/standalone /app/frontend/
COPY --from=frontend-builder /frontend/.next/static /app/frontend/.next/static
COPY --from=frontend-builder /frontend/public /app/frontend/public

# ── nginx config ──
COPY docker/nginx.conf /etc/nginx/sites-available/default

# ── entrypoint ──
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# SQLite lives on a mounted volume at /data
RUN mkdir -p /data

EXPOSE 80

CMD ["/entrypoint.sh"]

