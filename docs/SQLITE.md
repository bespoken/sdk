# Working with SQLite and Metabase
## Overview
We want to make it easy to process runs using SQL and reporting.

To that end, we make it easy to push data to SQLite and visualize reports using Metabase.

## Configuration
To send data to SQLite, set the `printer` attribute to `sqlite-printer`, like so:
```
{
  "printer": "sqlite-printer"
}
```

This will automatically create a table labeled `results` with data from the run.

The `results` table will always have the following columns: `utterance`, `run`, `job` and `success`.

In addition, it will also have any columns defined as expected fields or output fields.

If results are printed to the same table over and over again, any new columns will be automatically added to the table.

The database will be automatically created and stored at the path: `output/results.db`.

## Running SQL Queries
SQLite can be run using Docker. To run a query against the created database, launch a SQL prompt like so:  
```
docker run  -v "PATH_TO_PROJECT/output:/opt/data" -it keinos/sqlite3 .open /opt/data/results.db
```

## Running Metabase
Metabase can be run using Docker. To start it up, run it like so:
```
docker run -d -p 3000:3000 -v "PROJECT_PATH/output:/metabase-data" bespoken/metabase
```

Then connect to it locally at [http://localhost:3000](http://localhost:3000).

There is a default username and password setup - support@bespoken.io - ask jpk@bespoken.io for the password.

Once you have logged in, you will need to import you local SQLite database. To do this:  
* Go to `Settings -> Admin`
* Select `Databases`
* Select `Add Database`
* Select `SQLite` for the `Database type`
* Enter a name such as `results` for the `Name` field
* Enter `/metabase-data/results.db` for `Filename` field (or whatever the correct path/name is for your DB)
* Select `Save`

Now you can browse, query, and visualize your data with ease!

## Reference Information
### Importing Data
https://www.sqlitetutorial.net/sqlite-import-csv/
Loads columns into same position on subsequent runs

### Running SQLite with Docker
https://hub.docker.com/r/keinos/sqlite3

### GUI Tools
https://sqlitebrowser.org/
https://sqlitestudio.pl/

### Creating Graphs on SQLLITE
https://querytreeapp.com/
https://www.metabase.com/

### Running Metabase on an AWS server
docker run -d -p 3000:3000 -v "/home/ec2-user/metabase:/metabase-data" -e MB_DB_FILE=/metabase-data/metabase.db metabase/metabase

### TODO
- [ ] add quotes around columns for ones with spaces in names
- [ ] selectively add in missing columns - https://stackoverflow.com/questions/18920136/check-if-a-column-exists-in-sqlite