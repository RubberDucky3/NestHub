#!/bin/bash
docker run --name homehub-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=homehub \
  -p 5432:5432 \
  -d postgres

echo "Database started! Connection string: postgresql://postgres:postgres@localhost:5432/homehub"
