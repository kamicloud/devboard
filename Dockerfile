FROM node:22

COPY . /workspace/

CMD cd /workspace && yarn install && yarn build:server && yarn start

#docker build -t sincerely-devtools .
#docker run -d --mount type=bind,source=$(pwd),target=/workspace/ sincerely-devtools
#docker run -d -p 3579:3000 --mount type=bind,source=$(pwd),target=/workspace/ sincerely-devtools
