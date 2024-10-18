export VERSION=${KWITCH_VERSION:-latest}

docker build . --target api \
    --tag sukjuhong/kwitch-api:$VERSION

docker build . --target socket \
    --tag sukjuhong/kwitch-socket:$VERSION

docker build . --target web \
    --tag sukjuhong/kwitch-web:$VERSION
