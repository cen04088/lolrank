# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app
# Railway 는 서비스 변수를 build arg 로 넘겨준다. VITE_* 는 빌드 시점에 번들에 포함된다.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---- serve ----
FROM nginx:1.27-alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=80
EXPOSE 80
