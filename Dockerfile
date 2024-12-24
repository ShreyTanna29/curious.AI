# Use an official Node.js runtime
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files for better caching during dependency installation
COPY package*.json ./

# Copy Prisma schema before installing dependencies
COPY prisma ./prisma

# Clean npm cache and install dependencies
RUN npm cache clean --force && rm -rf /root/.npm/_cacache && npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the port and start the app
EXPOSE 3000
CMD ["npm", "run", "dev"]
