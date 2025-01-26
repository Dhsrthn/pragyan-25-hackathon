FROM node:22-alpine as base
WORKDIR /app
COPY package*.json ./yarn.lock ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine as prod
COPY --from=base /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]