# Data Persistence
This section outlines how the Doar system stores and persists data across all services, even when containers are stopped or restarted.

## MongoDB Volume: mongodata
- Stores:

  - Users

  - Mails

  - Labels

  - Mail views (per user-folder mapping)

- Docker Volume: mongodata

- Location inside container: /data/db

- Persisted using Docker volume mount

``` bash
volumes:
  - mongodata:/data/db
```

## URL Data Volume: urldata
- Used by the C++ blacklist server

- Stores:

  - urlsdata.txt — list of blacklisted URLs
  - bloomfilterdata.bin - the bloom filter

- Docker Volume: urldata

- Mounted to /usr/src/app/data inside the C++ container

``` bash
volumes:
  - urldata:/usr/src/app/data
```
## File: urlsdata.txt
- Format: Plaintext, one URL per line

- Updated when:

  - A mail is marked as spam (URLs added)

  - A mail is unmarked (URLs removed)

- Automatically reloaded by the blacklist server on restart

## Navigating Inside Containers
Use these commands to inspect or modify volume-mounted files:

### View MongoDB data (not recommended for manual edits):
in a new terminal window

``` bash
docker exec -it mongo mongosh 
```

Once you’re at the mongosh> prompt do:

``` bash
use doarDatabase
```
now that you are inside the project data base you can do:

``` bash
show collections
```

``` bash
db.<yourCollection>.find().pretty()
```

for example:

``` bash
db.users.find().pretty()
```

### Inspect URL file inside C++ container:
in a new terminal window: 

```bash
docker exec -it server-container bash
```
This will give you an interactive shell inside the container.

Once inside, you can navigate to the data directory in order to see balcklisted urls:

```bash
cd data
```
Inside the data folder, you'll find the file urlsdata.txt, which contains the list of blacklisted URLs. To view its contents, run:

```bash
cat urlsdata.txt
```

## Volume Removal & Restoration

To wipe persisted data:

``` bash
docker compose down -v --remove-orphans
```
This clears both mongodata and urldata.
Use with caution — this removes all stored users, mails, and blacklist URLs.

To preserve volumes across restarts:

``` bash
docker compose down
docker compose up
```
