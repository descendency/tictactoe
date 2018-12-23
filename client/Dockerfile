FROM node:latest
EXPOSE 3000/tcp
RUN mkdir /code
WORKDIR /code
RUN npx create-react-app my-app
RUN rm -rf ./my-app/src
ADD . /code/my-app
WORKDIR /code/my-app
CMD ["npm", "start"]
