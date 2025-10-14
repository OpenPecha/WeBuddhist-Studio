# Stage 1: Build
FROM node:20-alpine AS build-stage

LABEL maintainer="dharmadutta"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

FROM nginx:stable-alpine

WORKDIR /app

RUN chown nginx:nginx /app && apk add --no-cache gettext

# Set default environment variable for nginx stage
# ENV VITE_BACKEND_BASE_URL=$VITE_BACKEND_BASE_URL

ENV PORT=4173

# Copy the React build files into Nginx's public directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/
COPY nginx/studio.conf.template /etc/nginx/conf.d/
COPY nginx/security-headers.conf /etc/nginx/

EXPOSE 4173

CMD ["sh", "-c", "envsubst '${VITE_BACKEND_BASE_URL}' < /etc/nginx/conf.d/studio.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
