from django.test import TestCase

from webapp.forms import ItemForm
from webapp.models import User, Collection, CollectionPermission, Item, Accessor, OWNER, GUEST
from webapp.util import server_side_md


class ModelPermissionsTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user('a', 'a@a.com', 'a')
        self.user2 = User.objects.create_user('b', 'b@b.com', 'b')

        self.coll1 = Collection.objects.create(user=self.user1, name='coll A')
        self.coll2 = Collection.objects.create(user=self.user1, name='coll B')
        self.item1 = Item.objects.create(collection=self.coll1, title='foo', content='bar')
        self.item2 = Item.objects.create(collection=self.coll2, title='faz', content='bez')

        self.perm1 = CollectionPermission.objects.create(user=self.user1, collection=self.coll1, permission=OWNER)
        self.perm2 = CollectionPermission.objects.create(user=self.user1, collection=self.coll2, permission=OWNER)

        self.perm3 = CollectionPermission.objects.create(user=self.user2, collection=self.coll1, permission=GUEST)

    def test_simple_access(self):
        a1 = Accessor(self.user1)

        cs1 = a1.query_collections()

        assert len(cs1) == 2
        assert cs1[0] == self.coll1
        assert cs1[1] == self.coll2

        is1 = a1.query_items()

        assert len(is1) == 2
        assert self.item1 in is1
        assert self.item2 in is1

    def test_new_permissions(self):
        a1 = Accessor(self.user1)
        a2 = Accessor(self.user2)

        assert len(a1.query_collections()) == 2
        assert len(a2.query_collections()) == 1
        assert self.coll1 in a2.query_collections()
        assert len(a1.query_collections(owner=True)) == 2
        assert len(a2.query_collections(owner=True)) == 0

        assert len(a1.query_items()) == 2
        assert self.item1 in a1.query_items()
        assert self.item2 in a1.query_items()
        assert len(a2.query_items()) == 1
        assert self.item1 in a2.query_items()
        assert len(a1.query_items(owner=True)) == 2
        assert len(a2.query_items(owner=True)) == 0


class ValidationTest(TestCase):
    def test_url_validator(self):
        data = {
            'title': 'My title',
            'notes': '',
            'content': 'Some stuff',
            'typ': 'E'
        }
        f = ItemForm(data)
        assert f.is_valid()

        data['typ'] = 'U'
        f = ItemForm(data)
        assert not f.is_valid()

        data['content'] = 'https://lasernotes.com'
        f = ItemForm(data)
        assert f.is_valid()


class MarkdownTest(TestCase):
    def test_xss(self):
        evil_content = '''
This is evil content.

First we have a script tag:

<script>alert('foo')</script>

Then we also have an evil link:

<a href="javascript:alert('bar')">Linky</a>

Finally we have an [evil md link](javascript:3+3) and a good
[good md link](foo/bar/baz?q=foo).
        '''

        rendered = server_side_md(evil_content)

        assert '<script>' not in rendered
        assert '3+3' not in rendered
        assert 'foo/bar/baz?q=foo' in rendered
        assert "alert('bar')" not in rendered
