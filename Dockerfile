# Multi-stage build: build the library with Node and generate the site with a lightweight Ruby image
FROM node:18-alpine AS nodebuilder
WORKDIR /app

# Copy package descriptors first for better layer caching
COPY package.json package-lock.json* ./

# Copy source (including build script, demos and src)
COPY . .

# Install dev dependencies required for the build and run the project's build script
RUN npm install && npm run build

FROM ruby:3.3-alpine AS jekyllbuilder
WORKDIR /app

# Copy project sources and generated JS assets from node build
COPY --from=nodebuilder /app .

# Install Ruby package build tools and Jekyll dependencies
RUN apk add --no-cache build-base git && \
    gem install bundler:2.3.25 && \
    bundle config set path /usr/local/bundle && \
    bundle install && \
    bundle exec jekyll build --config _config.yml,_config.dev.yml && \
    cp -r assets _site/ || true

FROM nginx:alpine

# Copy built Jekyll site into nginx webroot
COPY --from=jekyllbuilder /app/_site /usr/share/nginx/html
# Copy static assets from source
COPY assets /usr/share/nginx/html/assets
# Ensure local assets and dist are available
COPY --from=jekyllbuilder /app/assets /usr/share/nginx/html/assets
COPY --from=nodebuilder /app/dist /usr/share/nginx/html/dist

# Nginx config
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
