# Base node image
FROM node:lts-alpine AS base

# Set environment variable
ENV NODE_ENV=production

# Install required dependencies
RUN apk add --no-cache openssl sqlite

# Create user and set ownership
RUN addgroup student && \
    adduser -D -H -g "student" -G student student && \
    mkdir /cst8918-a01 && \
    chown -R student:student /cst8918-a01

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /cst8918-a01

COPY package.json ./
RUN npm install

# Setup production node_modules
FROM base AS production-deps

WORKDIR /cst8918-a01

COPY --from=deps /cst8918-a01/node_modules /cst8918-a01/node_modules
COPY package.json ./
RUN npm prune --omit=dev

# Build the app
FROM base AS build

WORKDIR /cst8918-a01

COPY --from=deps /cst8918-a01/node_modules /cst8918-a01/node_modules
COPY . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base AS final

ENV PORT=8080

WORKDIR /cst8918-a01

COPY --from=production-deps /cst8918-a01/node_modules /cst8918-a01/node_modules
COPY --from=build /cst8918-a01/build /cst8918-a01/build
COPY --from=build /cst8918-a01/public /cst8918-a01/public
COPY --from=build /cst8918-a01/package.json /cst8918-a01/package.json

RUN chown -R student:student /cst8918-a01
USER student

CMD ["npm", "start"]
