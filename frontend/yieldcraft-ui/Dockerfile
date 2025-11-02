# Stage 1: Build Angular app
FROM node:22 AS build

WORKDIR /app

# Copy only the package files first
COPY package*.json ./

# Install dependencies (faster due to caching)
RUN npm ci

# Copy the rest of the Angular project
COPY . .

# Build the production app
RUN npm run build --prod

# Stage 2: Serve app using Nginx
FROM nginx:stable-alpine

# Copy built files from the build stage
COPY --from=build /app/dist/yieldcraft-ui /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
