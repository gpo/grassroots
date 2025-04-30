#!/bin/bash
npm install

pushd .
cd grassroots-frontend
npm install
popd

pushd .
cd grassroots-backend
npm install
popd

# Instead of a traditional repo, we symlink shared code from the backend into the frontend.
# Details on why are in the Readme.md.
ln -sf "$(pwd)/grassroots-backend/src/grassroots-shared/" "$(pwd)/grassroots-frontend/src"
cp dev.env.sample dev.env
cp test.env.sample test.env

echo "Update dev.env and test.env appropriately."
