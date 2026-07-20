# ─────────────────────────────────────────────────────────────
# The Gaskins — multi-stage Docker build
# Stage 1: Node 22 builds the static Astro site → ./dist
# Stage 2: nginx:alpine serves the compiled static files
# ─────────────────────────────────────────────────────────────

# ---- Stage 1: build ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source and build the static site
COPY . .
RUN npm run build

# ---- Stage 2: serve ----
FROM nginx:alpine AS serve

# Astro static output lands in /dist → copy into nginx html root
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config: SPA-style fallback + clean 404s + gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
