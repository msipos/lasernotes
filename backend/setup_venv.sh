#!/bin/bash

virtualenv --python=python3.4 venv
. venv/bin/activate
pip install --upgrade pip
pip install Django
pip install pytz
pip install gunicorn
pip install psycopg2  # remember to install libpq-dev
pip install restless
pip install django-bootstrap3
pip install markdown  # Server side rendering of markdown
pip install bleach  # Serer side sanitization of markdown
pip install django-user-accounts
pip install django-mailgun
pip install python-social-auth
