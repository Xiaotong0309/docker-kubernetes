FROM node:11.14
#specifying work directory
WORKDIR /usr/app
#copy build files
#minimizing rebuilds
COPY ./package.json ./ 
RUN npm install
COPY ./ ./

CMD ["npm", "start"]