#!/bin/sh
set -e

poetry run python manage.py migrate --noinput
exec poetry run gunicorn project.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --timeout 60
