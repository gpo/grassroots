#!/bin/bash
set -e  # Exit immediately if a command exits with non-zero status

#install pnpm and give it a path
npm install -g pnpm --prefix ~/.local
export PATH="$HOME/.local/bin:$PATH"

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

# Function to create symlink for grassroots-shared
create_shared_symlink() {
    local source="$1"
    local destination="$2"
    
    if [ -L "$destination" ] || [ -e "$destination" ]; then
        echo "Removing existing file/symlink"
        rm -rf "$destination"
    fi
    ln -sf "$source" "$destination"
    echo "Symlink created successfully"
}

# Install dependencies for each project
install_deps_if_needed "/app" "root"
install_deps_if_needed "/app/grassroots-frontend" "frontend"
install_deps_if_needed "/app/grassroots-backend" "backend"

# Create the symlink
create_shared_symlink "/app/grassroots-backend/src/grassroots-shared" "/app/grassroots-frontend/src/grassroots-shared"

# Execute the command passed to docker run
echo "Running command: $@"
exec "$@"
