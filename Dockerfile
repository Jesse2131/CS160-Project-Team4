# Use an official Node.js runtime as a parent image
FROM node:19.6

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app's source code to the container
COPY . .

# Expose port 3000, which is the port that the app listens on
EXPOSE 13000

# Start the app
CMD ["node", "server.js"]
