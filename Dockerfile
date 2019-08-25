FROM node:alpine 
WORKDIR app
COPY package.json .
RUN npm install > /dev/null
COPY app.js .
COPY test.js .
COPY test-cdn.txt .

CMD ["npm", "test"]