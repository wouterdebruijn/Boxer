FROM debian:stable-slim

# Install deno dependencies
RUN apt-get update && apt-get install -y curl unzip

# Install docker
RUN apt-get -y install ca-certificates curl gnupg lsb-release
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update && apt-get install -y docker-ce-cli docker-compose-plugin

# Create user
RUN useradd -ms /bin/bash boxer
WORKDIR /home/boxer/app

ADD . .
RUN chown boxer:boxer -R /home/boxer/app
USER root

# Install deno
RUN curl -fsSL https://deno.land/x/install/install.sh | sh

ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

RUN deno cache --lock-write main.ts

EXPOSE 8000

CMD ["deno", "run", "--allow-env", "--allow-net","--allow-read", "--allow-run", "main.ts"]