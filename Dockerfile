FROM node:18-bullseye

WORKDIR /app

RUN apt-get update && \
    apt-get install -y ffmpeg python3 yt-dlp

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
