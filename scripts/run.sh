docker run \
    --name kwitch \
    --env-file .env \
    --network host \
    --rm \
    sukjuhong/kwitch