#!/bin/bash
npm install

cp .env.development.local.sample .env.development.local
cp .env.test.sample .env.test

echo "Update .env.development and .env.test appropriately."
echo "Then run `npx mikro-orm migration:up`"
