FROM node:18-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json ./
COPY prisma ./prisma/
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Verify dist exists
RUN ls -la dist/

# Expose port
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# Start - sync db then run app
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main.js"]
