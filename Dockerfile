FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./

COPY prisma ./prisma

RUN npm cache clean --force

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]