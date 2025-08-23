FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Fix file permissions and ownership
RUN chown -R nextjs:nodejs /app && chmod 644 /app/favicon.svg

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]