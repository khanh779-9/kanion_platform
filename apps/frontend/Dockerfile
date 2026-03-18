FROM node:20-bookworm-slim

WORKDIR /app

# Install backend dependencies
COPY package.json ./
RUN npm install

# Copy backend source
COPY . .

ENV NODE_ENV=production

# Render injects PORT automatically
EXPOSE 8080

CMD ["npm", "run", "dev"]

