FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app files
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "index.js"]
