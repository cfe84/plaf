FROM node AS build
WORKDIR /files
RUN npm install -g plaf
CMD plaf --in /files/in --out /files/out
