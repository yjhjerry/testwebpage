FROM node:alpine 
WORKDIR app
COPY package*.json .
RUN npm install > /dev/null
COPY . . 
CMD ["npm", "start"]