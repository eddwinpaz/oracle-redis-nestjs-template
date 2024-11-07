# # Start with the Node.js base image
# FROM node:18

# # # Create a non-root user and set permissions
# # RUN useradd -m appuser

# # # Switch to the non-root user
# # USER appuser

# # Create app directory
# WORKDIR /app

# # Copy package.json and install dependencies
# COPY package*.json ./
# RUN npm install 
# # RUN npm install --ignore-scripts

# # Copy the rest of the application code
# COPY src/ ./src
# COPY dist/ ./dist

# # Build the NestJS application
# RUN npm run build

# # Expose the application port
# EXPOSE 3000

# # Run the application
# CMD ["npm", "run", "start:prod"]

# Start with the Node.js base image
FROM node:18

# Create a non-root user
RUN useradd -m appuser

# Set up the application directory and switch to it
WORKDIR /app

# Copy only package.json and package-lock.json to install dependencies first
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy the rest of the application code
COPY src/ ./src
COPY dist/ ./dist
COPY package*.json ./

# Change ownership of the application files to the non-root user
RUN chown -R appuser /app

# Switch to the non-root user
USER appuser

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start:prod"]
