FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Build-time arg: bakes the backend URL into the static Next.js bundle
# NEXT_PUBLIC_* variables MUST be set at build time, not just runtime
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api/v1
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

RUN npm run build

EXPOSE 3000

# Production start - no HMR, no WebSocket errors
CMD ["npm", "start"]
