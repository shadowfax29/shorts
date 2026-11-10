FROM node:20-slim

RUN apt-get update && \
    apt-get install -y ffmpeg python3 curl ca-certificates && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp && \
    yt-dlp --version && \
    ffmpeg -version && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3001

# YouTube/Instagram change often and old yt-dlp builds break. Self-update on every
# boot (non-fatal if offline), then start the API.
CMD ["sh", "-c", "yt-dlp -U || true; exec node index.js"]
