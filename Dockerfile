FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies (sqlite3, uuid, etc.)
RUN npm install

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