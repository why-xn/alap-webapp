### STAGE 2: Setup ###
FROM  whyxn/node-web-server:latest

WORKDIR /usr/src/app/public
COPY dist/alap-webapp/browser/. .
ENV PORT 8080
EXPOSE 8080
