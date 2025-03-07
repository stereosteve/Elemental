```
apk add --update docker docker-compose rsync

rsync -vhra --filter=':- .gitignore' . root@155.138.212.30:elemental
```

create .env file

docker compose up -d --build
