#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432 -t 30
/opt/wait-for-it.sh redis:6379 -t 30
/opt/wait-for-it.sh mosquitto:1883 -t 30
/opt/wait-for-it.sh mongo:27017 -t 30
npm run build
npm run migration:run
npm run seed
npm run prod
