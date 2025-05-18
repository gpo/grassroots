#!/bin/bash
npm install

cp .env.development.sample .env.development
cp .env.test.sample .env.test

echo "Update .env.development and .env.test appropriately."
