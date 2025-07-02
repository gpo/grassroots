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

# We need to make these before we mount them to make sure the permissions are correct.
RUN mkdir node_modules && \
    mkdir -p grassroots-frontend/node_modules && \
    mkdir -p grassroots-backend/node_modules && \
    mkdir -p grassroots-frontend/dist && \
    mkdir -p grassroots-backend/dist && \
    chown $UNAME -R *

USER ${UNAME}

# Vite
EXPOSE 5173
# Nest
EXPOSE 3000

# Note that this is overridden when using a vscode devcontainer. If updating this,
# also update .devcontainer.json's "postStartCommand".
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# For dev, we don't actually want to run npm run dev, it's better to do that manually. For prod,
# we'd want to:
# CMD ["npm", "run", "dev"]

CMD ["sleep", "infinity"]
