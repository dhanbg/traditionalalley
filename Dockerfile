# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Build the Next.js app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Accept build-time environment variables for NEXT_PUBLIC_*
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRAPI_API_TOKEN
ARG ENABLE_PRODUCTION_DEBUG
# These are automatically picked up by Next.js at build time if referenced in the code
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRAPI_API_TOKEN=$NEXT_PUBLIC_STRAPI_API_TOKEN
ENV ENABLE_PRODUCTION_DEBUG=$ENABLE_PRODUCTION_DEBUG
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install wget for healthchecks and dumb-init to handle zombie processes
RUN apk add --no-cache wget dumb-init

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets and static files
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy the standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create required directories for uploads and set permissions
RUN mkdir -p /app/public/uploads/invoices && \
    chown -R nextjs:nodejs /app

# Limit Node.js memory to prevent excessive CPU usage
ENV NODE_OPTIONS="--max-old-space-size=768"

# Switch to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Use dumb-init to handle zombie processes and signals properly
CMD ["dumb-init", "node", "server.js"]