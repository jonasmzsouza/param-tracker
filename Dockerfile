# Multi-stage build: build the library with Node then copy artifacts to a lightweight nginx image
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package descriptors first for better layer caching
COPY package.json package-lock.json* ./

# Copy source (including build script, demos and src)
COPY . .

# Install dev dependencies required for the build and run the project's build script
RUN npm install && npm run build

FROM nginx:alpine

# Copy built assets and demos into nginx webroot
COPY --from=builder /app/dist /usr/share/nginx/html/dist
COPY --from=builder /app/demos /usr/share/nginx/html

# Nginx config
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
