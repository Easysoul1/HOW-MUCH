#!/bin/sh
set -e

echo "==> Running Django migrations..."
cd /app/backend
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Starting Gunicorn (Django) on :8000..."
gunicorn config.wsgi:application \
  --bind 127.0.0.1:8000 \
  --workers 2 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - &

echo "==> Starting Next.js on :3000..."
PORT=3000 HOSTNAME=127.0.0.1 NODE_ENV=production node /app/frontend/server.js &

echo "==> Starting nginx on :80..."
exec nginx -g "daemon off;"
