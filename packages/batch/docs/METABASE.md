## Setup ECS Service
fargate service \
  --command ignore, \
  --taskDefinition ../batch-tester/server/TaskDefinition.json \
  --name metabase \
  --containerPort 3000 \
  --image metabase/metabase \
  --hostname metabase.bespoken.io \
  --launchType EC2 \
  --memory 512 \
  --cpu 5 \
  --env MB_DB_TYPE=mysql \
  --env MB_DB_HOST=mysql.bespoken.io \
  --env MB_DB_DBNAME=metabase \
  --env MB_DB_PORT=3306 \
  --env MB_DB_USER=$MYSQL_USER \
  --env MB_DB_PASS=$MYSQL_PASS

## Migration
https://www.metabase.com/docs/latest/operations-guide/migrating-from-h2.html

Use the full path to the database file, as recommended here:  
https://github.com/metabase/metabase/issues/7221#issuecomment-505334765

Docker command:  
```
docker run -it --entrypoint /bin/bash -v "C:/Users/jpk/bspk/batch-tester/server:/var/metabase" -p 3000:3000 metabase/metabase
```

Java Migration command:
```
java -DMB_DB_TYPE=mysql -DMB_DB_DBNAME=metabase -DMB_DB_PORT=3306 -DMB_DB_USER=admin -DMB_DB_PASS=Vjzrpc9wA9Sn -DMB_DB_HOST=mysql.bespoken.io -jar /app/metabase.jar load-from-h2 /var/metabase/metabase.db/metabase.db
```

