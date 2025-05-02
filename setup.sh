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
cp .env.development.sample .env.development
cp .env.test.sample .env.test

echo "Update .env.development and .env.test appropriately."
