# Stage 1: Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the build script (Vite + esbuild)
RUN npm run build

# Stage 2: Runtime stage
FROM node:20-slim

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 5173

# Set production environment
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "run", "start"]
