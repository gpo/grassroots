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

cp .env.development.sample .env.development
cp .env.test.sample .env.test

echo "Update .env.development and .env.test appropriately."
