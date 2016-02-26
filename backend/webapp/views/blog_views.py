import datetime

from django.http import Http404
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse

from webapp.models import BlogCollection, Item
from webapp.util import audit_msg


def all_blogs_page(request):
    audit_msg(request, 'all blogs')
    blogs = BlogCollection.objects.all()

    context = {
        'blogs': blogs
    }

    return TemplateResponse(request, 'blog/all_blogs.html', context)


def root_page(request, blog_slug):
    blog = get_object_or_404(BlogCollection.objects, slug=blog_slug)

    items = Item.objects.filter(collection=blog.collection, visibility=Item.VISIBLE_ON_BLOG)

    audit_msg(request, 'Root of blog %s' % blog_slug)

    context = {
        'blog': blog,
        'items': items
    }

    return TemplateResponse(request, 'blog/blog_root.html', context)


def item_page(request, blog_slug, year, month, day, item_slug):
    blog = get_object_or_404(BlogCollection.objects, slug=blog_slug)
    date = datetime.date(int(year), int(month), int(day))
    items = Item.objects.filter(collection=blog.collection, created_at__date=date, visibility=Item.VISIBLE_ON_BLOG)

    if len(items) == 0:
        raise Http404('No such item')

    audit_msg(request, 'Visit to %s / %s' % (blog_slug, item_slug))

    context = {
        'blog': blog,
        'items': items
    }

    return TemplateResponse(request, 'blog/blog_item.html', context)
