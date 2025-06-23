#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432 -t 30
/opt/wait-for-it.sh redis:6379 -t 30
/opt/wait-for-it.sh mosquitto:1883 -t 30
/opt/wait-for-it.sh mongo:27017 -t 30
npm run build
npm run migration:run
SEED_FLAG_FILE="/usr/src/app/.seed_completed"
if [ ! -f "$SEED_FLAG_FILE" ]; then
  echo "Running seed for first time setup..."
  npm run seed
  touch "$SEED_FLAG_FILE"
  echo "Seed completed and flag file created."
else
  echo "Seed already completed in a previous run. Skipping..."
fi
npm run prod
