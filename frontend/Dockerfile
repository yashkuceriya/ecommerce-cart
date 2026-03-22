FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npx vite build
RUN npm install -g serve

CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
