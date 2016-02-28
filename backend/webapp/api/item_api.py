from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils.text import slugify
from restless.exceptions import BadRequest, NotFound
from restless.preparers import FieldsPreparer

from webapp import forms
from webapp import models
from webapp.api.app_resource import AppResource
from webapp.util import audit_msg


class ItemResource(AppResource):
    general_preparer = FieldsPreparer(fields={
        'id': 'id',
        'title': 'title',
        'notes': 'notes',
        'typ': 'typ',
        'created_at': 'created_at',
        'visibility': 'visibility'
    })

    # This is a little ugly, URLs pass the content field always.
    general_url_preparer = FieldsPreparer(fields={
        'id': 'id',
        'title': 'title',
        'notes': 'notes',
        'typ': 'typ',
        'created_at': 'created_at',
        'visibility': 'visibility',
        'content': 'content'
    })

    detail_preparer = FieldsPreparer(fields={
        'id': 'id',
        'title': 'title',
        'notes': 'notes',
        'typ': 'typ',
        'content': 'content',
        'visibility': 'visibility',
        'created_at': 'created_at',
        'edited_at': 'edited_at',
        'collection_id': 'collection.id',
        'collection_name': 'collection.name'
    })

    def _prepare(self, obj):
        if 'detail' in self.request.GET:
            return self.detail_preparer.prepare(obj)
        else:
            if obj.typ == 'U':
                return self.general_url_preparer.prepare(obj)
            return self.general_preparer.prepare(obj)

    ### Parsing query params

    def _get_collection_id(self):
        collection = self.request.GET.get('collection', None)
        if not collection:
            raise BadRequest('Validation failure: need collection id')
        try:
            collection = int(collection)
        except ValueError:
            raise BadRequest('Validation failure: invalid collection id: %r' % collection)
        return collection

    def _get_collection(self):
        accessor = models.Accessor(self.request.user)
        id = self._get_collection_id()
        try:
            return accessor.query_collections().get(id=id)
        except ObjectDoesNotExist:
            raise NotFound('No such collection: %r' % id)

    def _get_page(self):
        if 'page' not in self.request.GET:
            raise BadRequest('Validation failure: need page number')
        try:
            page = int(self.request.GET['page'])
        except ValueError:
            raise BadRequest('Validation failure: invalid page: %r' % self.request.GET['page'])
        if page <= 0:
            raise BadRequest('Validation failure: invalid page: %r' % page)
        return page

    def _get_sort_by(self):
        if 'sortBy' not in self.request.GET:
            return '-created_at'
        try:
            m = {
                'ct': '-created_at',
                't': 'title',
                'et': '-edited_at'
            }
            return m[self.request.GET['sortBy']]
        except ValueError:
            raise BadRequest('Unknown sortBy')

    def _get_q(self):
        return self.request.GET.get('q', None)

    ### REST API

    def list(self):
        audit_msg(self.request)

        accessor = models.Accessor(self.request.user)

        if self._get_q():
            q = self._get_q()
            query_set = accessor.query_items().filter(
                collection__encrypted=False).filter(Q(title__icontains=q) | Q(notes__icontains=q))
        else:
            collection_id = self._get_collection_id()
            query_set = accessor.query_items().filter(collection__id=collection_id).order_by(self._get_sort_by())
        paginator = Paginator(query_set, 8)
        page = self._get_page()

        # Note serialize_list below!
        return {'num_pages': paginator.num_pages, 'objects': [self._prepare(x) for x in paginator.page(page)]}

    def serialize_list(self, data):
        """ Not really documented: list will wrap {'objects: ...'} and prep
        objects, but we don't want that.  TODO: This is a possible bug in the
        future when Restless gets updated! """
        return self.serializer.serialize(data)

    def create(self):
        audit_msg(self.request)

        form = forms.ItemForm(self.data)
        if not form.is_valid():
            raise BadRequest('Validation failure: %r' % form.errors)

        return self._prepare(models.Item.objects.create(
            collection=self._get_collection(),
            title=form.cleaned_data['title'],
            content=form.cleaned_data['content'],
            notes=form.cleaned_data['notes'],
            typ=form.cleaned_data['typ']
        ))

    def update(self, pk):
        audit_msg(self.request)

        form = forms.ItemForm(self.data)
        if not form.is_valid():
            raise BadRequest('Validation failure: %r' % form.errors)

        accessor = models.Accessor(self.request.user)
        try:
            item = accessor.query_items().get(id=pk)
        except ObjectDoesNotExist:
            raise NotFound('No id = %r' % pk)

        if 'collection_id' in self.data:
            cid = form.cleaned_data['collection_id']
            if item.collection.encrypted:
                raise BadRequest('Cannot move from an encrypted journal')
            try:
                collection = accessor.query_collections().get(id=cid)
            except ObjectDoesNotExist:
                raise NotFound('No collection id = %r' % cid)
            if collection.encrypted:
                raise BadRequest('Cannot move to an encrypted journal')
            item.collection = collection
        if 'title' in self.data:
            item.title = form.cleaned_data['title']
        if 'content' in self.data:
            item.content = form.cleaned_data['content']
        if 'notes' in self.data:
            item.notes = form.cleaned_data['notes']
        if 'typ' in self.data:
            item.typ = form.cleaned_data['typ']
        if 'created_at' in self.data:
            month, day, year = [int(x) for x in form.cleaned_data['created_at'].split('/')]
            d = item.created_at
            item.created_at = d.replace(year=year, month=month, day=day)
        if 'visibility' in self.data:
            item.visibility = form.cleaned_data['visibility']
            slug = slugify(item.title)
            if len(slug) > 50:
                slug = slug[:50]
            item.slug = slug
        item.save()
        return self._prepare(item)

    def detail(self, pk):
        audit_msg(self.request)

        accessor = models.Accessor(self.request.user)
        try:
            return self._prepare(accessor.query_items().get(id=pk))
        except ObjectDoesNotExist:
            raise NotFound('No id = %r' % pk)

    def delete(self, pk):
        audit_msg(self.request)

        accessor = models.Accessor(self.request.user)
        try:
            accessor.query_items(owner=True).get(id=pk).delete()
        except ObjectDoesNotExist:
            raise NotFound('No id = %r' % pk)
