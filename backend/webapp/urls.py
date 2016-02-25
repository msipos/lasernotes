from django.conf.urls import include, url
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from webapp.views import auth_views
from webapp.views import blog_views
from webapp.views import main_views
from webapp.api.collection_api import CollectionResource
from webapp.api.item_api import ItemResource

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),

    url('', include('social.apps.django_app.urls', namespace='social')),

    url(r"^account/signup/$", auth_views.SignupView.as_view()),
    url(r"^account/login/$", auth_views.LoginView.as_view()),
    url(r"^account/", include("account.urls")),

    url(r'^$', main_views.root_page),
    url(r'^app/', main_views.app_page),

    url(r'^api/v1/collections/', include(CollectionResource.urls())),
    url(r'^api/v1/items/', include(ItemResource.urls())),

    url(r'^blogs/$', blog_views.all_blogs_page),
    url(r'^blogs/([a-z0-9\-]+)/$', blog_views.root_page),
    url(r'^blogs/([a-z0-9\-]+)/([0-9]{4})/([0-9]{2})/([0-9]{2})/([a-z0-9\-]+)/$', blog_views.item_page,
        name='blog_item'),
]

# Static files
urlpatterns += staticfiles_urlpatterns()
