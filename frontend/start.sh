#!/bin/sh
PORT="${PORT:-8080}"
echo "Starting on port $PORT"
exec serve -s dist -l "$PORT"
