#!/bin/bash

echo 'sudo service postgresql start' >> ~/.bashrc

DB_NAME=kwitch
DB_EXIST=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXIST" != "1" ]; then
    psql -U postgres -c "CREATE DATABASE kwitch;"
fi

pnpm install