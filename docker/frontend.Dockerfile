# ==============================================================================
# Smart Energy AI - Frontend Production Dockerfile (Vite + Nginx)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build optimized distribution bundle
COPY frontend/ ./
RUN npm run build

# Production web server stage
FROM nginx:alpine

# Copy custom nginx configuration for client-side React SPA routing
RUN rm -rf /etc/nginx/conf.d/*
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location /api/ {\n\
        proxy_pass http://backend:8000/api/;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade $http_upgrade;\n\
        proxy_set_header Connection "upgrade";\n\
        proxy_set_header Host $host;\n\
        proxy_cache_bypass $http_upgrade;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
