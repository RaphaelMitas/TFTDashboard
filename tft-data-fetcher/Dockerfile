# Start from Node.js base image
FROM node:20-alpine

# Set working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies in the Docker container
RUN npm install

# Copy the rest of your app's source code to the working directory
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port that your app runs on
EXPOSE 5000

# Define the Docker container's start command with the compiled JavaScript file
CMD [ "node", "dist/index.js" ]
