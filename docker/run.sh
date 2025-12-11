#!/bin/bash

# start the dbs and run the static images with NO source volumes mounted, this is what we'll ship to k8s
docker compose --file compose.yaml --file compose.run.yaml up -d
