web: sh -c "cd backend && python manage.py migrate && python manage.py collectstatic --noinput && python -m daphne -b 0.0.0.0 -p $PORT dating_core.asgi:application"
