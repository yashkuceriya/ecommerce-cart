FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

RUN python manage.py collectstatic --noinput 2>/dev/null || true

ENV PORT=8050
EXPOSE 8050

CMD gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers 3 --timeout 120
