FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy the package.json and pnpm-lock.yaml files
COPY package.json pnpm-lock.yaml ./

# Install project dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .


RUN ["pnpm", "build"]


# Expose the port the app runs on
EXPOSE 4201

# Start the application
CMD ["pnpm", "prod"]

