# Maya API Dockerfile
FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]
