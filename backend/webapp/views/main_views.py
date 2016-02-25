from django.contrib.auth.decorators import login_required
from django.template.response import TemplateResponse

from webapp.util import audit_msg


def root_page(request):
    audit_msg(request, 'Root page')
    return TemplateResponse(request, 'front_page.html')


@login_required
def app_page(request):
    audit_msg(request, 'Session started')
    return TemplateResponse(request, 'app.html')
