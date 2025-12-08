#!/usr/bin/env sh

turbo build

if [ "$TO_LAUNCH" = "backend" ]; then
  cd grassroots-backend && pnpm start:prod
elif [ "$TO_LAUNCH" = "frontend" ]; then
  cd grassroots-frontend && pnpm preview
else
  echo "Unknown TO_LAUNCH value: $TO_LAUNCH"
  exit 1
fi
