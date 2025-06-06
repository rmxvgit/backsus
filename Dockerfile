# Stage 1: Build Python environment with pandas/numpy
FROM python:3.10-slim as python-base

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Stage 2: Build Node.js environment with NestJS and Prisma
FROM node:18-bullseye as builder

# Install LuaLaTeX and dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    texlive-luatex \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-plain-generic \
    lmodern \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY nest-cli.json .
COPY tsconfig*.json ./
COPY prisma/schema.prisma ./prisma/

RUN npm install -g @nestjs/cli && npm install

# Generate Prisma client
RUN npx prisma generate

# Copy all files and build the project
COPY . .
RUN npm run build

# Stage 3: Final production image
FROM node:18-bullseye-slim

# Copy Python environment from python-base
COPY --from=python-base /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy LuaLaTeX dependencies from builder
COPY --from=builder /usr/share/texlive /usr/share/texlive
COPY --from=builder /usr/bin/lualatex /usr/bin/lualatex
COPY --from=builder /etc/texmf /etc/texmf

# Install minimal runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    libpython3.9 \
    fonts-lmodern \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Environment variables
ENV NODE_ENV production
ENV PORT 3000
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/health || exit 1

# Start command
CMD ["node", "dist/main.js"]
