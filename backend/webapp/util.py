import logging

import bleach
from django.conf import settings
from django.core.mail import send_mail
import markdown

from webapp.html_tags import generally_xss_safe, attrs

logger = logging.getLogger(__name__)


def ordinal(num):
    if num % 10 == 1:
        return '%sst' % num
    if num % 10 == 2:
        return '%snd' % num
    if num % 10 == 3:
        return '%srd' % num
    return '%sth' % num


def send_admin_email(subject, text):
    send_mail(subject, text, settings.SERVER_EMAIL, settings.ADMIN_EMAILS, fail_silently=True)


def server_side_md(content):
    return bleach.clean(markdown.markdown(content, ['markdown.extensions.extra']), generally_xss_safe, attrs)


def audit_msg(request, msg=None):
    email = None
    if request.user:
        if not request.user.is_authenticated():
            email = "Anon"
        else:
            email = request.user.email
    ip = request.META.get("REMOTE_ADDR", None)
    logger.info('AUDIT %s %s %s %s %s' % (email, ip, request.method, request.get_full_path(), msg))
