#!/bin/bash

# todo: resolve selective xhost permissions

if [[ "$OSTYPE" == "darwin"* ]]; then
    export DISPLAY=host.docker.internal:0
fi

xhost +

export LOCAL_USER_ID=`id -u $USER`

docker-compose -f ./docker/docker-compose.suite-test.yml up --build --abort-on-container-exit
