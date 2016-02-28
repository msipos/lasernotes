import logging
import traceback

from django.conf import settings
from restless.dj import DjangoResource

logger = logging.getLogger(__name__)


class AppResource(DjangoResource):
    ### Restless settings

    def bubble_exceptions(self):
        return settings.DEBUG

    def is_authenticated(self):
        return self.request.user.is_authenticated()

    def handle_error(self, err):
        """ Log the error in addition to sending it back. """
        status = getattr(err, 'status', 500)
        if status >= 500:
            logger.error(traceback.format_exc())
        else:
            logger.warning(traceback.format_exc())
        return super(AppResource, self).handle_error(err)
