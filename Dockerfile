# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:22-alpine AS runner
WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend assets to expected dist location
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose server port
ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "src/server.js"]
