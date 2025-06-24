# Build stage
FROM node:22.16.0-alpine AS build

# Install prerequisites
RUN wget https://github.com/tj/node-prune/releases/download/v1.0.1/node-prune_1.0.1_linux_amd64.tar.gz && \
    tar -xzf node-prune_1.0.1_linux_amd64.tar.gz && \
    mv node-prune /usr/local/bin/ && \
    rm node-prune_1.0.1_linux_amd64.tar.gz

RUN mkdir -p /usr/build

WORKDIR /usr/build

COPY package.json yarn.lock ./

# install dependencies 
RUN yarn install --ignore-platform 

COPY . .

# build application
RUN yarn build

# run node prune
RUN node-prune /usr/build

# Production stage
FROM node:22.16.0-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY --from=build /usr/build/dist ./dist
COPY --from=build /usr/build/node_modules ./node_modules
COPY .env ./.env

CMD ["node", "dist/main.js"]
