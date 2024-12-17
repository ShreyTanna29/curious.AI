FROM node:18

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Copy Prisma schema to ensure it is present before npm install
COPY prisma ./prisma

# Clean npm cache
RUN npm cache clean --force && rm -rf /root/.npm/_cacache

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port and start the app
EXPOSE 3000
CMD ["npm", "run", "dev"]
