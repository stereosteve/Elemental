## On host:

Choose alpine linux, install docker deps:

```
apk add --update docker docker-compose rsync

service docker start
rc-update add docker boot

sysctl -w vm.max_map_count=262144
```

- create .env file

## Deploy from local

- add `elemental` Host to `~/.ssh/config`
- `make`

## Seed Search:

```
ssh elemental
docker exec -it elemental sh
pnpm reindex
```
