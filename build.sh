pushd ./server
docker build -t tictactoe-server .
popd
pushd ./client
docker build -t tictactoe-client .
popd
docker-compose up
