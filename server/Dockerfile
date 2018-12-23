FROM golang:latest
EXPOSE 4001/tcp
RUN mkdir /code
ADD index.go /code
WORKDIR /code
RUN go get -d -v github.com/gorilla/websocket
RUN go build index.go
CMD ["/code/index"]
