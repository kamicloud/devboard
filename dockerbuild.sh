#!/bin/bash

docker build . -t sincerely-devtools
docker rm devtools
docker run -P --name=devtools sincerely-devtools
