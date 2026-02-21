FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml uv.lock .python-version README.md ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy application code
COPY app/ app/

# Railway injects PORT at runtime; default to 8000 for local
ENV PORT=8000
ENV HOST=0.0.0.0

# Expose port (informational)
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT}/api/v1/health')" || exit 1

# Start server - Railway will override PORT
CMD ["sh", "-c", "uv run uvicorn app.main:app --host $HOST --port $PORT"]
