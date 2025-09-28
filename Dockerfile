ARG NODE_VERSION=23.0.0
FROM node:${NODE_VERSION}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir ${PNPM_HOME}

RUN npm install -g corepack@latest
RUN corepack enable

ENV TURBO_DAEMON=false

# Use production node environment by default.
# ENV NODE_ENV=production

# --omit=dev

# Run the application as a non-root user, where we control the UID & GID.
ARG UNAME=grassroots_dev
ARG UID=1000
ARG GID=1000

WORKDIR /app

# Get the twilio CLI, instruction here: https://www.twilio.com/docs/twilio-cli/quickstart
RUN wget -qO- https://twilio-cli-prod.s3.amazonaws.com/twilio_pub.asc | apt-key add - && \
  touch /etc/apt/sources.list.d/twilio.list && \
  echo 'deb https://twilio-cli-prod.s3.amazonaws.com/apt/ /' | tee /etc/apt/sources.list.d/twilio.list && \
  apt-get update && \
  apt-get install -y sudo && \
  apt install -y twilio

# First remove the node user to avoid uid/gid conflicts, then we create our user.
RUN deluser node --remove-home \
    && groupadd -g ${GID} ${UNAME} \
    && useradd -g ${UNAME} -u ${UID} ${UNAME} -m \
    && echo "${UNAME} ALL=(ALL) NOPASSWD:ALL" | tee /etc/sudoers.d/${UNAME}-nopasswd \
    && chmod 440 /etc/sudoers.d/${UNAME}-nopasswd

# We want to do an initial build here to make sure all the symlinks are sorted
# out before anything can possibly bind to them.
# By doing this here, container local directories take precedence over
# bind mounted directories.

# Technically we should maybe install dependencies as one step, and then copy source in as another step
# as that breaks the image cache less often, but this is much easier.
COPY --chown=${UNAME}:${UNAME} . .
RUN chown $UNAME:$UNAME /app ${PNPM_HOME}

USER ${UNAME}

RUN pnpm add turbo --global
RUN pnpm install --frozen-lockfile

# Vite
EXPOSE 5173
# Nest
EXPOSE 3000

# For dev, we don't actually want to run pnpm run dev, it's better to do that manually. For prod,
# we'd want to:
# CMD ["pnpm", "run", "dev"]

CMD ["sleep", "infinity"]
