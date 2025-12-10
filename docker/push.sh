#!/bin/bash

version=$(docker run grassroots_intermediary:latest pnpm pkg get version | tr -d '"')
image=northamerica-northeast2-docker.pkg.dev/gpo-eng-stage/gpo/grassroots:${version}

docker tag grassroots_build:latest ${image}
docker push ${image}
