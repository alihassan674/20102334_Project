FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# NEXT_PUBLIC_* vars must be baked in at BUILD time for Next.js static bundle
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api/v1
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

RUN npm run build

EXPOSE 3000

# Production mode: no HMR, no WebSocket errors
CMD ["npm", "start"]
