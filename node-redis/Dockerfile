FROM node:11.14

WORKDIR /usr/app

COPY ./package.json ./ 
RUN npm install
COPY ./ ./

CMD ["npm", "start"]