```
apk add postgresql17-client

# test
psql postgres://root:password@localhost:5432

curl https://audius-pgdump.s3-us-west-2.amazonaws.com/discProvProduction.dump -O

pg_restore -d 'postgres://root:password@localhost:5432' --username root --disable-triggers --no-privileges --clean --if-exists --verbose -j 8 discProvProduction.dump
```
