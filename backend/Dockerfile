# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema for generating client
COPY prisma ./prisma

EXPOSE 3001

# Command will be overridden by docker-compose
CMD ["npm", "run", "dev"]
