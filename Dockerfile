ARG NODE_VERSION=23.0.0
FROM node:${NODE_VERSION}

# Use production node environment by default.
# ENV NODE_ENV=production

# --omit=dev

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

COPY --chmod=755 docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN npm install -g pnpm

# We want to do an initial build here to make sure all the symlinks are sorted
# out before anything can possibly bind to them.
# By doing this here, container local directories take precedence over
# bind mounted directories.

# Technically we should maybe install dependencies as one step, and then copy source in as another step
# as that breaks the image cache less often, but this is much easier.
COPY --chown=${UNAME}:${UNAME} . .
RUN chown $UNAME:$UNAME /app

USER ${UNAME}
RUN pnpm install

# Vite
EXPOSE 5173
# Nest
EXPOSE 3000

# Note that this is overridden when using a vscode devcontainer. If updating this,
# also update .devcontainer.json's "postStartCommand".
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# For dev, we don't actually want to run pnpm run dev, it's better to do that manually. For prod,
# we'd want to:
# CMD ["pnpm", "run", "dev"]

CMD ["sleep", "infinity"]
