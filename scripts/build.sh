export VERSION=${KWITCH_VERSION:-latest}

docker build . \
    --tag sukjuhong/kwitch:$VERSION