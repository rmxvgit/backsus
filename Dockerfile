# Stage 1: Builder stage with all build tools
FROM node:18-bullseye as builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Python environment
    python3 \
    python3-venv \
    python3-dev \
    # LuaLaTeX and TeX Live
    texlive-luatex \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-plain-generic \
    lmodern \
    # Build tools
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set up npm cache
ENV npm_config_cache=/root/.npm

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci

# Set up Python virtual environment
RUN python3 -m venv --copies /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application files and build
COPY . .
RUN npm run build

# Stage 2: Final production image
FROM node:18-bullseye-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    # Python runtime
    python3 \
    # LuaLaTeX minimal runtime
    texlive-luatex \
    texlive-latex-base \
    lmodern \
    fonts-lmodern \
    && rm -rf /var/lib/apt/lists/*

# Copy Python virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy LuaLaTeX files from builder
COPY --from=builder /usr/share/texlive /usr/share/texlive
COPY --from=builder /etc/texmf /etc/texmf
COPY --from=builder /usr/bin/lualatex /usr/bin/lualatex

# Copy built Node.js application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Set up PATH (matches Railway's configuration)
ENV PATH="/app/node_modules/.bin:/opt/venv/bin:$PATH"

# Verify installations
RUN lualatex --version && \
    python3 -c "import numpy, pandas; print(f'numpy: {numpy.__version__}, pandas: {pandas.__version__}')"

# Application port
EXPOSE 3000

# Start command
CMD ["node", "dist/main.js"]
