#!/bin/bash
# This script sets up stub files needed for TypeScript to compile before the real files are generated.

# Exit immediately if a command exits with a non-zero status.
set -e

# Change to the script's directory to ensure paths are correct
cd "$(dirname "$0")/.."

# If metadata.ts doesn't exist, copy the stub file.
if [ ! -f "src/metadata.ts" ]; then
  echo "metadata.ts not found. Copying stub."
  cp "src/metadata.stub.ts" "src/metadata.ts"
fi

# If OpenAPI.gen.ts doesn't exist, copy the stub file.
if [ ! -f "src/grassroots-shared/OpenAPI.gen.ts" ]; then
  echo "OpenAPI.gen.ts not found. Copying stub."
  cp "src/grassroots-shared/OpenAPI.gen.stub.ts" "src/grassroots-shared/OpenAPI.gen.ts"
fi
