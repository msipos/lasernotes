import logging
import hashlib

from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from webapp.util import send_admin_email, server_side_md

logger = logging.getLogger(__name__)


class Collection(models.Model):
    user = models.ForeignKey(User)  # Owner, will be deprecated in favor of permissions
    name = models.CharField(max_length=240)

    # Encryption:
    encrypted = models.BooleanField(default=False)  # Is it an encrypted journal?
    # Clientside effective password = pkbdf(password + salt) (in JSON)
    encrypted_effective_password_params = models.CharField(null=True, max_length=4096)
    encrypted_challenge = models.CharField(null=True, max_length=4096)  # Challenge random text
    # Challenge response in JSON (including HMAC metadata):
    encrypted_challenge_hash = models.CharField(null=True, max_length=4096)
    encrypted_challenge_params = models.CharField(null=True, max_length=4096)  # Params of challenge encryption in JSON

    # Blogging:
    blogged = models.BooleanField(default=False, db_index=True)  # Is this collection shared as a blog.

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        if self.encrypted:
            return '%s: %s (encrypted)' % (self.user.email, self.name)
        else:
            return '%s: %s' % (self.user.email, self.name)

    def ensure_blog_exists(self):
        if not hasattr(self, 'blog'):
            return BlogCollection.objects.create(collection=self)
        return self.blog


class BlogCollection(models.Model):
    collection = models.OneToOneField(Collection, on_delete=models.CASCADE, related_name='blog')
    slug = models.SlugField(unique=True)
    description = models.CharField(max_length=2048)

    audited = models.BooleanField(default=False)

    def get_rendered_sidebar(self):
        return server_side_md(self.description)


OWNER = 'O'  # Can delete underlying
GUEST = 'G'  # Can access underlying but not delete
PERMISSION_TYPES = [
    (OWNER, 'Owner'),
    (GUEST, 'Guest')
]


class CollectionPermission(models.Model):
    user = models.ForeignKey(User)
    collection = models.ForeignKey(Collection)
    permission = models.CharField(max_length=1, choices=PERMISSION_TYPES)

    class Meta:
        unique_together = (('user', 'collection'),)

    def __str__(self):
        return '%s: is %s of %s' % (self.user.email, self.permission, self.collection.name)


class Item(models.Model):
    ENTRY = 'E'
    URL = 'U'
    ITEM_TYPES = [
        (ENTRY, 'Entry'),
        (URL, 'URL')
    ]

    PRIVATE = 'P'  # Private
    VISIBLE_ON_BLOG = 'V'  # Visible on blog
    VISIBILITY_TYPES = [
        (PRIVATE, 'Private'),
        (VISIBLE_ON_BLOG, 'Visible on blog')
    ]

    collection = models.ForeignKey(Collection)

    title = models.CharField(max_length=240)
    content = models.TextField()
    notes = models.CharField(max_length=512, default='')
    typ = models.CharField(max_length=1, choices=ITEM_TYPES, default=ENTRY)

    visibility = models.CharField(max_length=1, choices=VISIBILITY_TYPES, default=PRIVATE)
    slug = models.SlugField(null=True)  # Used only in the case of the blog

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    # Revision ID
    revision = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return '%s: %s: %s' % (self.collection.user.email, self.collection.name, self.title)

    def get_rendered_content(self):
        return server_side_md(self.content)

    def get_url_fragment(self):
        """ Get URL fragment of form 2015/02/21/foo-bar/. """
        d = self.created_at
        return '%d/%02d/%02d/%s/' % (d.year, d.month, d.day, self.slug)


class Blog(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    sidebar_note = models.CharField(max_length=1024)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title

    def get_rendered_sidebar(self):
        return server_side_md(self.sidebar_note)


class BlogItem(models.Model):
    blog = models.ForeignKey(Blog)
    item = models.ForeignKey(Item)
    slug = models.SlugField()
    date = models.DateField()

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return '%s: %s' % (self.blog.title, self.item.title)

    def get_url_fragment(self):
        """ Get URL fragment of form 2015/02/21/foo-bar/. """
        d = self.date
        return '%d/%02d/%02d/%s/' % (d.year, d.month, d.day, self.slug)

    class Meta:
        unique_together = (('blog', 'slug', 'date'),)
        ordering = ['-date']


class BlogPermission(models.Model):
    user = models.ForeignKey(User)  # Owner
    blog = models.ForeignKey(Blog)
    permission = models.CharField(max_length=1, choices=PERMISSION_TYPES)

    def __str__(self):
        return '%s: is %s of %s' % (self.user.email, self.permission, self.collection.name)

    class Meta:
        unique_together = (('user', 'blog'),)


### Handlers


@receiver(pre_save, sender=User)
def user_pre_save_insntiate_username(sender, instance, *args, **kwargs):
    if len(instance.email) > 24:
        hash = hashlib.sha224(instance.email.encode('utf8')).hexdigest()[:6]
        instance.username = instance.email[:24] + hash
    else:
        instance.username = instance.email


@receiver(post_save, sender=User)
def user_post_create_send_email(sender, instance, created, *args, **kwargs):
    if created:
        msg = 'User %s (%s) was created' % (instance.username, instance.email)
        send_admin_email('User created', msg)


### Accessor object


class Accessor(object):
    def __init__(self, user):
        self.user = user

    def query_collections(self, owner=False):
        if owner:
            return Collection.objects.filter(
                collectionpermission__user=self.user,
                collectionpermission__permission=OWNER)
        else:
            return Collection.objects.filter(collectionpermission__user=self.user)

    def query_items(self, owner=False):
        if owner:
            return Item.objects.filter(
                collection__collectionpermission__user=self.user,
                collection__collectionpermission__permission=OWNER,
            )
        else:
            return Item.objects.filter(collection__collectionpermission__user=self.user)
