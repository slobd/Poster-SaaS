# Docker related workflows and advice

## Run PGAdmin
If you which to use pgadmin to connect to the database run
`docker-compose -f docker-compose.base.yml up pgadmin`

**email**: dev@posterlab.co

**password**: development


## Clean databases
This command will stop postgres, delete your postgres volumes, and start postgres again
`yarn restart:postgres`

## Commands you may need

Docker CLI documentation is quite good, you can add `--help` after every command to know more about it. E.g `docker logs --help`

```sh
docker logs -f [service]
```
Fetch the logs of a container

-f Follow log output

```
docker container ls [OPTIONS]
```
List containers

```
docker images [OPTIONS] [REPOSITORY[:TAG]]
```
List images

```
docker volume rm [OPTIONS] VOLUME [VOLUME...]
```
Remove one or more volumes. You cannot remove a volume that is in use by a container.