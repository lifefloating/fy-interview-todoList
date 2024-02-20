FROM node:20

ENV TZ Asia/Shanghai

RUN mkdir -p /data/app/

WORKDIR /data/app/

COPY package*.json /data/app/

RUN npm install --registry=https://npmmirror.com

COPY . /data/app/

EXPOSE 3000

RUN ls -al
CMD ["sh", "-c", "npm run start:${NODE_ENV}"]
