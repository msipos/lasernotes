"""
Django settings for lo2 project.
"""

from webapp.settings_base import *  # noqa

SECRET_KEY = '...'
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
#INSTALLED_APPS += ['debug_toolbar']

# ********************************************************* Database

# Connect local instance to local backend
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# ********************************************************* Email

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

ADMINS = [('Foo', 'foo@example.com')]
ADMIN_EMAILS = ['foo@example.com']
DEFAULT_FROM_EMAIL = 'foo@example.com'
SERVER_EMAIL = 'foo@example.com'

# ********************************************************* Auth

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = '.'
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = '.'
