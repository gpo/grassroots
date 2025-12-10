#!/bin/bash

wait() {
  echo "waiting"

  while true; do
    # wait until the intermediary build container exits with RC=0
    container_status=$(docker inspect grassroots-grassroots_intermediary-1 | jq '.[].State.Status' -r)

    if [[ $container_status = "exited" ]]; then
      rc=$(docker inspect grassroots-grassroots_intermediary-1 | jq '.[].State.ExitCode' -r)
      if [[ $rc -eq 0 ]]; then
        break
      else
        echo "Intermediary build container exited with nonzero code. Aborting."
        exit $rc
      fi
    else
      echo "still waiting"
      sleep 1
    fi
  done
}

# first we clean up leftovers to get fresh builds
find ../ -type d -name dist -exec rm -rf {} \;

# bring up dbs and grassroots with local source mounted as volumes, this runs turbo build
docker compose --file compose.yaml --file compose.build.yaml up --build --remove-orphans -d

wait # I'm not sure if this is necessary, or sufficient to detect the successful finish of the build

# bring the intermediary build composition down
docker compose --file compose.yaml --file compose.build.yaml down

# now we manually ADD the ./dist dirs to the final build
docker build .. -f ../Dockerfile.deploy -t grassroots_build:latest

# start the dbs and run the static images with NO source volumes mounted, this is what we'll ship to k8s
docker compose --file compose.yaml --file compose.run.yaml up -d
