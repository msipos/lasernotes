import os


# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ********************************************************* Core settings

SITE_ID = 1

WSGI_APPLICATION = 'webapp.wsgi.application'
ROOT_URLCONF = 'webapp.urls'

INSTALLED_APPS = [
    'webapp',
    'account',  # User accounts
    'social.apps.django_app.default',  # Social login

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',  # Support for sessions
    'django.contrib.messages',  # Support for flash
    'django.contrib.staticfiles',
    'django.contrib.sites',

    # Custom:
    'bootstrap3',
]

MIDDLEWARE_CLASSES = [
    'webapp.middlewares.SetRemoteAddrFromForwardedFor',  # IP Address in reverse proxy
    'django.contrib.sessions.middleware.SessionMiddleware',  # Support for sessions
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # Associate user with request
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',  # Log out user after pw change
    'django.contrib.messages.middleware.MessageMiddleware',  # Support for flash messages
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # Support for clickjacking cache header
    'django.middleware.security.SecurityMiddleware',
    'account.middleware.LocaleMiddleware',
    'account.middleware.TimezoneMiddleware',
]

# Use persistent connections for the DB:
CONN_MAX_AGE = 1200

# ********************************************************* Templates

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'social.apps.django_app.context_processors.backends',
                'social.apps.django_app.context_processors.login_redirect',
                'account.context_processors.account',  # User accounts
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',  # Support for flash messages
            ],
        },
    },
]

# ********************************************************* Internationalization

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# ********************************************************* Auth

LOGIN_URL = '/account/login/'
LOGIN_REDIRECT_URL = '/app/'

# Account app settings:
ACCOUNT_SIGNUP_REDIRECT_URL = "/account/login/"
ACCOUNT_LOGIN_REDIRECT_URL = "/app/"

ACCOUNT_EMAIL_UNIQUE = True
ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = True

AUTHENTICATION_BACKENDS = [
    "social.backends.google.GoogleOAuth2",
    "account.auth_backends.EmailAuthenticationBackend"
]


# ********************************************************* Static

STATIC_URL = '/static/'
STATICFILES_DIRS = (os.path.join(BASE_DIR, "static"),)
STATIC_ROOT = (os.path.join(BASE_DIR, 'static_root'))

# ********************************************************* Logging

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'propagate': True,
        },
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
        'webapp': {
            'handlers': ['console', 'mail_admins'],
            'level': 'INFO',
        }
    }
}

# ********************************************************* Celery

CELERY_BROKER = 'redis://localhost/0'
