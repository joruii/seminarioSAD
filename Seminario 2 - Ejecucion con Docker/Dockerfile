FROM node:12

#Directorio de la app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .


CMD ["node","Carrito.js"]
