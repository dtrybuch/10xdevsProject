# Build stage
FROM node:lts-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:lts-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --production

# Copy build output from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.astro ./node_modules/.astro

# Copy necessary files for server
COPY --from=build /app/astro.config.mjs ./astro.config.mjs

# Expose the port
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Start the application
CMD ["node", "./dist/server/entry.mjs"] 