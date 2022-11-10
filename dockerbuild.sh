#!/bin/bash

docker build . -t sincerely-devtools
docker run -P sincerely-devtools --name=devtools
