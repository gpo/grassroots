ARG NODE_VERSION=23.0.0
FROM node:${NODE_VERSION}

# Run the application as a non-root user, where we control the UID & GID.
ARG UNAME=grassroots_dev
ARG UID=1000
ARG GID=1000

WORKDIR /app

RUN apt-get update && apt-get install -y sudo

# First remove the node user to avoid uid/gid conflicts, then we create our user.
RUN deluser node --remove-home \
    && groupadd -g ${GID} ${UNAME} \
    && useradd -g ${UNAME} -u ${UID} ${UNAME} -m \
    && echo "${UNAME} ALL=(ALL) NOPASSWD:ALL" | tee /etc/sudoers.d/${UNAME}-nopasswd \
    && chmod 440 /etc/sudoers.d/${UNAME}-nopasswd

# This is required to avoid permissions issues.
RUN mkdir node_modules && \
    mkdir -p grassroots-frontend/node_modules && \
    mkdir -p grassroots-backend/node_modules && \
    mkdir -p grassroots-shared/node_modules && \
    mkdir -p eslint_rules/node_modules

RUN npm install -g pnpm

RUN chown $UNAME:$UNAME -R /app
USER ${UNAME}

# We want to do an initial build here to make sure all the symlinks are sorted
# out before anything can possibly bind to them.
# By doing this here, container local directories take precedence over
# bind mounted directories.
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./package.json
COPY grassroots-frontend/package.json grassroots-frontend/package.json
COPY grassroots-backend/package.json grassroots-backend/package.json
COPY grassroots-shared/package.json grassroots-shared/package.json
COPY eslint_rules/package.json eslint_rules/package.json

RUN pnpm install

# Vite
EXPOSE 5173
# Nest
EXPOSE 3000


# For dev, we don't actually want to run pnpm run dev, it's better to do that manually. For prod,
# we'd want to:
# CMD ["pnpm", "run", "dev"]

CMD ["sleep", "infinity"]
