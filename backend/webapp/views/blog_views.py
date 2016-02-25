import datetime

from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse

from webapp.models import Blog, BlogItem
from webapp.util import audit_msg


def all_blogs_page(request):
    audit_msg(request, 'all blogs')
    blogs = Blog.objects.all()

    context = {
        'blogs': blogs
    }

    return TemplateResponse(request, 'blog/all_blogs.html', context)


def root_page(request, blog_slug):
    blog = get_object_or_404(Blog.objects, slug=blog_slug)
    items = BlogItem.objects.filter(blog=blog).select_related('item')
    audit_msg(request, 'Root of blog %s' % blog_slug)

    context = {
        'blog': blog,
        'items': items
    }

    return TemplateResponse(request, 'blog/blog_root.html', context)


def item_page(request, blog_slug, year, month, day, item_slug):
    blog = get_object_or_404(Blog.objects, slug=blog_slug)
    date = datetime.date(int(year), int(month), int(day))
    blog_item = get_object_or_404(BlogItem.objects, blog=blog, date=date, slug=item_slug)

    audit_msg(request, 'Visit to %s / %s' % (blog_slug, item_slug))

    context = {
        'blog': blog,
        'item': blog_item
    }

    return TemplateResponse(request, 'blog/blog_item.html', context)
