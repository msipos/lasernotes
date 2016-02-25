from uuid import uuid4

import account.forms
import account.views


class LoginView(account.views.LoginView):
    form_class = account.forms.LoginEmailForm


class SignupForm(account.forms.SignupForm):
    def __init__(self, *args, **kwargs):
        super(SignupForm, self).__init__(*args, **kwargs)
        del self.fields["username"]


class SignupView(account.views.SignupView):
    form_class = SignupForm

    def generate_username(self, form):
        # do something to generate a unique username (required by the
        # Django User model, unfortunately)
        username = form.cleaned_data['email']
        if len(username) > 25:
            username = username[:25]
        username += uuid4().hex[:6]
        return username
