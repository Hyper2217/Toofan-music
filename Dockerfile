FROM node:18-bullseye

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg

# Install yt-dlp using pip
RUN pip3 install --break-system-packages yt-dlp

# Copy package.json
COPY package.json ./

# Install node packages
RUN npm install

# Copy app files
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
