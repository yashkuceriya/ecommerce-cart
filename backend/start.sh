#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Seeding data..."
python manage.py seed_problem_statements 2>/dev/null || true
python manage.py seed_demo_data 2>/dev/null || true
python manage.py seed_full_catalog 2>/dev/null || true

echo "Creating admin..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    u = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
    u.role = 'admin'
    u.first_name = 'Admin'
    u.save()
    print('Admin created')
else:
    print('Admin exists')
" 2>/dev/null || true

PORT="${PORT:-8050}"
echo "Starting server on port $PORT"
exec gunicorn config.wsgi:application --bind "0.0.0.0:$PORT" --workers 3 --timeout 120
