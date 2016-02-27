from django import forms
from django.core.validators import URLValidator


class CollectionForm(forms.Form):
    name = forms.CharField(min_length=1, max_length=240)

    encrypted = forms.BooleanField(required=False)

    effective_password_params = forms.CharField(max_length=4096, required=False)
    challenge = forms.CharField(max_length=4096, required=False)
    challenge_hash = forms.CharField(max_length=4096, required=False)
    challenge_params = forms.CharField(max_length=4096, required=False)

    blogged = forms.BooleanField(required=False)

    blog_slug = forms.SlugField(required=False)
    blog_desc = forms.CharField(max_length=2048, required=False)

    def clean(self):
        super(CollectionForm, self).clean()

        if self.cleaned_data['blogged']:
            if len(self.cleaned_data['blog_slug']) < 3:
                raise forms.ValidationError("Blog slug too short.")
            if len(self.cleaned_data['blog_desc']) == 0:
                raise forms.ValidationError('Blog description must exist.')


class ItemForm(forms.Form):
    collection_id = forms.IntegerField(min_value=0, required=False)
    title = forms.CharField(min_length=1, max_length=240, required=False)
    notes = forms.CharField(max_length=512, required=False)
    content = forms.CharField(max_length=100*1024, required=False)
    typ = forms.CharField(min_length=1, max_length=1, required=False)
    created_at = forms.CharField(min_length=10, max_length=10, required=False)
    visibility = forms.CharField(min_length=1, max_length=1, required=False)

    def clean(self):
        super(ItemForm, self).clean()

        if 'typ' in self.cleaned_data and self.cleaned_data['typ'] == 'U':
            url = self.cleaned_data['content']
            if '://' not in url and not url.startswith('http'):
                url = 'http://' + url
                self.cleaned_data['content'] = url
            v = URLValidator()
            v(url)
