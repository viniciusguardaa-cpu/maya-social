FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source and prisma
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Expose port
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# Start command - will run prisma db push at runtime
CMD sh -c "npx prisma db push --skip-generate && node dist/main.js"
