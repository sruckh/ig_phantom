FROM node:18-alpine3.19

# Set working directory
WORKDIR /app

# Install build dependencies for native modules (sqlite3)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies and rebuild better-sqlite3 for Alpine
RUN npm install --production && \
    npm rebuild better-sqlite3 --build-from-source

# Copy application files
COPY . .

# Fix favicon permissions
RUN chmod 644 favicon.svg

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port 3000 (Node.js proxy server)
EXPOSE 3000

# Start the Node.js proxy server
CMD ["npm", "start"]
