FROM node:20

RUN apt update && apt install -y awscli

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "build"]

