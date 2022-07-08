FROM node:16.15.1-alpine3.14

RUN apk add python2

COPY . /workspace/

RUN cd /workspace && yarn install && yarn build

CMD cd /workspace && yarn install && yarn build

#docker build -t sincerely-devtools .
#docker run --mount type=bind,source=$(pwd),target=/workspace/ sincerely-devtools
