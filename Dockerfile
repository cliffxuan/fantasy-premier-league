# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend source code
COPY frontend/ ./

# Build the frontend
# This will create the dist/ directory
RUN npm run build

# Stage 2: Setup Backend
FROM python:3.12-slim
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy project definition files
COPY pyproject.toml uv.lock ./

# Install dependencies into the system environment
RUN uv sync --frozen --no-dev --system

# Copy backend code
COPY backend ./backend

# Copy built frontend assets from the builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose the port (Dokku/Heroku will provide PORT env var)
ENV PORT=8000
EXPOSE $PORT

# Run the application
CMD sh -c "python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
