FROM node:18

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Force clean npm cache and remove any tar archives
RUN npm cache clean --force && \
    rm -rf /root/.npm/_cacache

# Install dependencies with strict flag
RUN npm install --force

# Copy prisma and application code
COPY prisma ./prisma
COPY . .

# Expose and run
EXPOSE 3000
CMD ["npm", "run", "dev"]
