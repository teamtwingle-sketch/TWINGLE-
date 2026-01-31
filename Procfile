web: python backend/manage.py migrate && python backend/manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p $PORT --root-path=/app/backend dating_core.asgi:application
