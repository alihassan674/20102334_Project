FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for prisma CLI)
RUN npm install

# Copy rest of backend source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]
