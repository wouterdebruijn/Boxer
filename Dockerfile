FROM denoland/deno:bin-1.24.1 AS deno
FROM ubuntu:latest
ARG DEBIAN_FRONTEND=noninteractive

# Setup docker / docker-compose
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

RUN apt-get update
RUN apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Setup Deno
COPY --from=deno /deno /usr/local/bin/deno

# The port that your application listens to.
EXPOSE 8000

WORKDIR /app

RUN useradd -m -s /bin/bash boxer
RUN usermod -aG docker boxer

ADD . .
RUN su boxer -c "deno cache main.ts"
CMD ["deno", "run", "--allow-env", "--allow-net","--allow-read", "--allow-run", "main.ts"]