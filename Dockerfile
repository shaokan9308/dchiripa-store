FROM node:20
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]