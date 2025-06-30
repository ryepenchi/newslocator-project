# Newslocator

A Web-App showing places mentioned in the news on a map.

**Try it:** [https://newslocator.ryepenchi.xyz/](https://newslocator.ryepenchi.xyz/) (Hopefully a live version)

Seperate Repo evaluating the quality of the geoparsing process [geoparsing-evaluation](https://github.com/ryepenchi/geoparsing-evalutation)

---
Dockerized version of previous build https://github.com/ryepenchi/newslocator 

Scraping news sites (currently only theGuardian.com) with **python** and **rssparser**

Geoparsing with external services using **geopy**

Managing data with a PostgreSQL database using **flask_sqlalchemy**

Displaying results with **Flask / Leaflet.js**

### How to Run

get the *docker-compose.yaml* and an *.env* from the *example_.env* into your project folder
create a pgdata folder

```
mkdir pgdata
docker compose up -d
```

### Set up cron job to periodically run scraper
```
crontab -e
```
and add
```
* 7,14,21 * * *    cd <your project folder> && /usr/bin/docker compose up -d 'ingest'
```
