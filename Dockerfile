FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src

WORKDIR /app

RUN pip install --no-cache-dir poetry==2.1.3

COPY pyproject.toml poetry.lock ./
RUN poetry install --only main --no-root --no-interaction

COPY . .

ARG SECRET_KEY
ARG BOX_DEVELOPER_TOKEN

RUN poetry run python manage.py collectstatic --noinput

EXPOSE 8000

ENTRYPOINT ["sh", "entrypoint.sh"]
