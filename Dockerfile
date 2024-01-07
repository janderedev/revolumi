FROM node:21 as build

WORKDIR /build/app
COPY package.json tsconfig.json /build/app/
COPY src /build/app/src/
RUN npm install --frozen-lockfile
RUN yarn build

FROM node:21 as run
WORKDIR /app
COPY --from=build /build/app/ /app/
COPY bin/uwurandom_x86_64 /usr/bin/uwurandom
CMD ["node", "--experimental-specifier-resolution=node", "dist"]
