# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./ 

# Install dependencies
RUN npm install --omit=dev  # Exclude dev dependencies

# Copy the rest of the application files
COPY . .

# Expose the backend port
EXPOSE 7000

# Start the backend server
CMD ["node", "index.js"]

