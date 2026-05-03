# Step 1: Use Node.js to build the app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Use a lightweight server to serve the static files
FROM node:20-alpine
WORKDIR /app
# Vite builds to the 'dist' folder by default
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]