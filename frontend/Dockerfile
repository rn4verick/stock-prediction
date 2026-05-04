# need node to run react
FROM node:18-alpine

WORKDIR /app

COPY package.json .


RUN npm install

COPY . .

# start the dev server
CMD ["npm", "start"]