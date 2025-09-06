#!/bin/bash
set -e  # Exit immediately if a command exits with non-zero status

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

# Create the symlink
create_shared_symlink "/app/grassroots-backend/src/grassroots-shared" "/app/grassroots-frontend/src/grassroots-shared"

# Execute the command passed to docker run
echo "Running command: $@"
exec "$@"
