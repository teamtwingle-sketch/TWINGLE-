web: python backend/manage.py migrate && python backend/manage.py collectstatic --noinput && python backend/manage.py seed_data && gunicorn --chdir backend dating_core.wsgi --log-file -
