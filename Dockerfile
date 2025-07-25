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
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# These are automatically picked up by Next.js at build time if referenced in the code
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRAPI_API_TOKEN=$NEXT_PUBLIC_STRAPI_API_TOKEN
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed for production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Expose the port the app runs on
EXPOSE 3000

# Set runtime environment variables (these will be provided via --env-file or -e at docker run)
# DO NOT hardcode secrets here. These lines are just for documentation/reference:
# ENV CLERK_SECRET_KEY=...
# ENV CLERK_WEBHOOK_SECRET=...
# ENV STRIPE_SECRET_KEY=...
# ENV STRIPE_WEBHOOK_SECRET=...
# ENV KHALTI_BASE_URL=...
# ENV KHALTI_SECRET_KEY=...
# ENV KHALTI_PUBLIC_KEY=...
# ENV KHALTI_RETURN_URL=...
# ENV KHALTI_WEBSITE_URL=...

CMD ["npm", "start"]