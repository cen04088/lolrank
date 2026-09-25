# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app
# Railway 는 서비스 변수를 build arg 로 넘겨준다. VITE_* 는 빌드 시점에 번들에 포함된다.
ARG VITE_API_BASE_URL
ARG VITE_KAKAOPAY_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_KAKAOPAY_URL=$VITE_KAKAOPAY_URL
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---- serve ----
FROM nginx:1.27-alpine
# worker_processes auto 는 호스트 코어 수만큼 워커를 띄워 RAM 을 낭비한다. 정적 파일만 서빙하므로 1개로 충분.
RUN sed -i 's/^worker_processes .*/worker_processes 1;/' /etc/nginx/nginx.conf
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=80
EXPOSE 80
