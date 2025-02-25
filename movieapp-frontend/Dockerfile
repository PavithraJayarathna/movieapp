# Stage 1: Build the React app
FROM node:18 as build-stage

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the React app using Nginx
FROM nginx:alpine

# Copy the built files from the build-stage to the nginx server
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose port 80 (default for nginx)
EXPOSE 80

# Start the nginx server
CMD ["nginx", "-g", "daemon off;"]