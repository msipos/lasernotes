from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.conf import settings

from restless.dj import DjangoResource
from restless.exceptions import BadRequest, NotFound
from restless.preparers import FieldsPreparer

from webapp import forms
from webapp import models
from webapp.util import audit_msg


class CollectionResource(DjangoResource):
    general_preparer = FieldsPreparer(fields={
        'id': 'id',
        'name': 'name',
        'encrypted': 'encrypted'
    })

    detail_preparer = FieldsPreparer(fields={
        'id': 'id',
        'name': 'name',
        'encrypted': 'encrypted',
        'effective_password_params': 'encrypted_effective_password_params',
        'challenge': 'encrypted_challenge',
        'challenge_hash': 'encrypted_challenge_hash',
        'challenge_params': 'encrypted_challenge_params'
    })

    def _prepare(self, obj):
        if 'detail' in self.request.GET:
            return self.detail_preparer.prepare(obj)
        else:
            return self.general_preparer.prepare(obj)

    ### Restless settings

    def bubble_exceptions(self):
        return settings.DEBUG

    def is_authenticated(self):
        return self.request.user.is_authenticated()

    ### REST API

    def list(self):
        audit_msg(self.request)
        accessor = models.Accessor(self.request.user)
        return [self._prepare(x) for x in accessor.query_collections()]

    def create(self):
        audit_msg(self.request)

        form = forms.NewCollectionForm(self.data)
        if not form.is_valid():
            raise BadRequest('Validation failure: %r' % form.errors)

        with transaction.atomic():
            if form.cleaned_data['encrypted']:
                coll = models.Collection.objects.create(
                    user=self.request.user,
                    name=form.cleaned_data['name'],
                    encrypted=form.cleaned_data['encrypted'],
                    encrypted_effective_password_params=form.cleaned_data['effective_password_params'],
                    encrypted_challenge=form.cleaned_data['challenge'],
                    encrypted_challenge_params=form.cleaned_data['challenge_params'],
                    encrypted_challenge_hash=form.cleaned_data['challenge_hash']
                )
            else:
                coll = models.Collection.objects.create(
                    user=self.request.user,
                    name=form.cleaned_data['name'],
                    encrypted=form.cleaned_data['encrypted'],
                )
            models.CollectionPermission.objects.create(user=self.request.user, collection=coll, permission=models.OWNER)

            audit_msg(self.request, 'Created %s' % coll.name)
        return self._prepare(coll)

    def detail(self, pk):
        audit_msg(self.request)

        accessor = models.Accessor(self.request.user)
        try:
            return self._prepare(accessor.query_collections().get(id=pk))
        except ObjectDoesNotExist:
            raise NotFound('Invalid collection id = %r' % pk)

    def delete(self, pk):
        audit_msg(self.request)

        accessor = models.Accessor(self.request.user)
        try:
            collection = accessor.query_collections(owner=True).get(id=pk)
            collection.delete()
        except ObjectDoesNotExist:
            raise NotFound('Invalid collection id = %r' % pk)