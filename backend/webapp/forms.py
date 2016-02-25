from django import forms
from django.core.validators import URLValidator


class NewCollectionForm(forms.Form):
    name = forms.CharField(min_length=1, max_length=240)
    encrypted = forms.BooleanField(required=False)
    effective_password_params = forms.CharField(max_length=4096, required=False)
    challenge = forms.CharField(max_length=4096, required=False)
    challenge_hash = forms.CharField(max_length=4096, required=False)
    challenge_params = forms.CharField(max_length=4096, required=False)

url_validator = URLValidator()


class ItemForm(forms.Form):
    title = forms.CharField(min_length=1, max_length=240, required=False)
    notes = forms.CharField(max_length=512, required=False)
    content = forms.CharField(max_length=100*1024, required=False)
    typ = forms.CharField(min_length=1, max_length=1, required=False)
    created_at = forms.CharField(min_length=10, max_length=10, required=False)

    def clean(self):
        super(ItemForm, self).clean()

        if 'typ' in self.cleaned_data and self.cleaned_data['typ'] == 'U':
            url = self.cleaned_data['content']
            if '://' not in url and not url.startswith('http'):
                url = 'http://' + url
                self.cleaned_data['content'] = url
            v = URLValidator()
            v(url)
