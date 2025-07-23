#!/bin/bash
set -e  # Exit immediately if a command exits with non-zero status

if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm --prefix ~/.local
    export PATH="$HOME/.local/bin:$PATH"
    if ! command -v pnpm &> /dev/null; then
      echo "Please rebuild docker"
    fi
fi

# Configure pnpm to use the mounted store volume (not the project directory)
export PNPM_HOME="/root/.pnpm-store"
export PNPM_STORE_DIR="/root/.pnpm-store"

# Function to check and install dependencies if needed
install_deps_if_needed() {
    local dir="$1"
    local name="$2"

    # If node modules is empty, install dependencies.
    if [ -z "$(ls -A $dir/node_modules)" ]; then
        echo "Installing $name dependencies..."
        cd "$dir" && pnpm i
    else
        echo "$name dependencies already installed, skipping."
    fi
    cd /app
}

# Install dependencies for each project
install_deps_if_needed "/app" "root"
install_deps_if_needed "/app/grassroots-frontend" "frontend"
install_deps_if_needed "/app/grassroots-backend" "backend"

# Execute the command passed to docker run
echo "Running command: $@"
exec "$@"
