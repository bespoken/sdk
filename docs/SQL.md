# Working with MySQL and Metabase
## Overview
We want to make it easy to process runs using SQL and reporting.

To that end, we make it easy to push data to MySQL and visualize reports using Metabase.

## Configuration
To send data to MySQL, set these environment variables:
```
MYSQL_HOST=<ASK_BESPOKEN>
MYSQL_USER=<ASK_BESPOKEN>
MYSQL_PASSWORD=<ASK_BESPOKEN>
MYSQL_DATABASE=<ASK_BESPOKEN>
```

This will automatically create a table labeled with the job name with data from the run. The data will be published to MySQL at the end conclusion of the run.

The table will always have the following columns: `utterance`, `run`, `job` and `success`.

In addition, it will also have any columns defined as expected fields or output fields.

If results are printed to the same table over and over again, any new columns will be automatically added to the table.

For each customer, a unique database with unique credentials will be created. Please talk to Bespoken to get access.

## Runninq SQL Queries
To connect directly to the database and run queries, any MySQL client can be used.

We recommend especially using [DBeaver](https://dbeaver.io/) - it is a free high-quality tool for browsing and querying databases.

## Running Metabase
Metabase can be accessed at:
```
http://metabase.bespoken.io:3000
```

Check with Bespoken to get access.

Now you can browse, query, and visualize your data with ease!
