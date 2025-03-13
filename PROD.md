```
apk add --update docker docker-compose rsync

sysctl -w vm.max_map_count=262144

rsync -vhra --filter=':- .gitignore' . root@155.138.212.30:elemental
```

create .env file

docker compose up -d --build

## Seed Search:

```
ssh elemental
docker exec -it elemental sh
pnpm reindex
```
