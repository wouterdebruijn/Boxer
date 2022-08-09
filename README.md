# Boxer | Docker compose management

Boxer lets you manage docker compose projects in a simple way. It wraps docker-compose and provides a elegant interface to manage your docker compose projects. It displays the status of your projects and their containers. It also provides a simple way to start, stop end edit your projects all in one place.

- :zap: Fast and easy to use.
- :wale: Easy to install using docker\
- :sparkles: Build using modern tools with a simple and elegant interface.
- :heart: Made with love by [@wouterdebruijn](https://wouterdebruijn.nl/)

## Installation
Make sure you have docker with the docker-compose plugin installed and running. Then boxer can be run directly or inside of a docker container.
### Docker
```bash
docker run -it -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock boxer
```
### Deno
```
deno task start
```