#!/bin/bash

docker build . -t sincerely-devtools
docker rm -f devtools
docker run -P --name=devtools sincerely-devtools
