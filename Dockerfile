# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install Python and build dependencies in smaller chunks
RUN apk add --no-cache python3 && \
    apk add --no-cache py3-pip && \
    apk add --no-cache build-base && \
    apk add --no-cache python3-dev

# Install LuaLaTeX and dependencies
RUN apk add --no-cache \
    texlive-full \
    texmf-dist-langportuguese \
    texmf-dist-latexextra \
    texmf-dist-pictures \
    texmf-dist-science \
    texmf-dist-bibtexextra \
    texmf-dist-pstricks \
    texmf-dist-music \
    texmf-dist-fontsextra \
    texmf-dist-fontsrecommended \
    texmf-dist-plainextra \
    texmf-dist-publishers \
    texmf-dist-latexrecommended \
    texmf-dist-mathextra \
    texmf-dist-fontutils \
    texmf-dist-luatex \
    texmf-dist-metapost \
    texmf-dist-xetex

# Install Python packages
RUN pip3 install --no-cache-dir numpy pandas

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install Python and runtime dependencies in smaller chunks
RUN apk add --no-cache python3 && \
    apk add --no-cache py3-pip

# Install LuaLaTeX and dependencies
RUN apk add --no-cache \
    texlive-full \
    texmf-dist-langportuguese \
    texmf-dist-latexextra \
    texmf-dist-pictures \
    texmf-dist-science \
    texmf-dist-bibtexextra \
    texmf-dist-pstricks \
    texmf-dist-music \
    texmf-dist-fontsextra \
    texmf-dist-fontsrecommended \
    texmf-dist-plainextra \
    texmf-dist-publishers \
    texmf-dist-latexrecommended \
    texmf-dist-mathextra \
    texmf-dist-fontutils \
    texmf-dist-luatex \
    texmf-dist-metapost \
    texmf-dist-xetex

# Install Python packages
RUN pip3 install --no-cache-dir numpy pandas

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]
