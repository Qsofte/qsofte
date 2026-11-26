# The Payments Desk: React app built with Node, served with the API by one Python process.
# Build context is desk/.
FROM node:22-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
# The embedding model for meaning-based search (about 65 MB), baked in so the server never
# downloads it. Its own layer, so code changes do not fetch it again.
ENV DESK_EMBED_CACHE=/app/models HF_HUB_OFFLINE=1
RUN HF_HUB_OFFLINE=0 python -c "from fastembed import TextEmbedding; TextEmbedding('BAAI/bge-small-en-v1.5', cache_dir='/app/models')"
COPY backend/ ./
COPY --from=web /web/dist ./static
RUN useradd --system --uid 10001 desk && chown -R desk /app/models
USER desk
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=4)"
# Migrate, seed reference data (and the first account if none), then serve.
# --proxy-headers: nginx in front sets X-Forwarded-*; the port is never published.
CMD ["sh", "-c", "alembic upgrade head && python -m app.cli bootstrap && exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips='*'"]
