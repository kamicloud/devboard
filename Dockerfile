FROM node:16

COPY . /workspace/

CMD cd /workspace && yarn install && yarn build && yarn start

#docker build -t sincerely-devtools .
#docker run --mount type=bind,source=$(pwd),target=/workspace/ sincerely-devtools
#docker run -d -p 3579:3000 --mount type=bind,source=$(pwd),target=/workspace/ sincerely-devtools
