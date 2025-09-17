FROM node:24.8.0 as build

WORKDIR /usr/src/app

COPY . .

WORKDIR /usr/src/app/Calculator

COPY package*\.json ./

RUN npm i

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /use/src/app/Calculator/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
