from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('username', 'email', 'roles')

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
            # Gérer la relation ManyToManyField
            if self.cleaned_data.get('roles'):
                user.roles.set(self.cleaned_data['roles'])
        return user

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name', 'phone_number', 'roles')

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
            # Gérer la relation ManyToManyField
            if self.cleaned_data.get('roles'):
                user.roles.set(self.cleaned_data['roles'])
        return user
