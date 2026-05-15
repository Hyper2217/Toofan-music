FROM node:18

WORKDIR /app

# Install python, ffmpeg, yt-dlp
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && pip3 install yt-dlp

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
