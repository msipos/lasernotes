import pprint
from django.contrib import admin
from django.contrib.sessions.models import Session
from webapp import models


class SessionAdmin(admin.ModelAdmin):
    def _session_data(self, obj):
        return pprint.pformat(obj.get_decoded()).replace('\n', '<br>\n')
    _session_data.allow_tags = True
    list_display = ['session_key', '_session_data', 'expire_date']
    readonly_fields = ['_session_data']
    exclude = ['session_data']
    date_hierarchy = 'expire_date'

admin.site.register(Session, SessionAdmin)

admin.site.register(models.Collection)
admin.site.register(models.BlogCollection, list_display=['collection', 'slug'])
admin.site.register(models.CollectionPermission)
admin.site.register(models.Item)

admin.site.register(models.Blog)
admin.site.register(models.BlogItem)
admin.site.register(models.BlogPermission)
