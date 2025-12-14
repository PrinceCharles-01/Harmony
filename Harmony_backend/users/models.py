from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from roles.models import Role
from django.db.models import JSONField # <-- AJOUTER CET IMPORT

# ---------------------------
# UTILISATEUR PERSONNALISÉ
# ---------------------------

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    matricule = models.CharField(max_length=20, unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    date_de_naissance = models.DateField(blank=True, null=True)
    lieu_de_naissance = models.CharField(max_length=100, blank=True, null=True)
    genre = models.CharField(max_length=10, choices=[('M', 'Masculin'), ('F', 'Féminin')], blank=True, null=True)
    nationalite = models.CharField(max_length=50, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    roles = models.ManyToManyField(Role, related_name='users')

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        return self.first_name

class Enseignant(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='enseignant_profile')
    grade = models.CharField(max_length=100, blank=True, null=True)
    # Nouveaux champs
    tags = JSONField(default=list, blank=True, help_text="Liste de tags décrivant les spécialités de l'enseignant (ex: ['Finance', 'Mathématiques'])")
    cycles = models.ManyToManyField('academics.Cycle', blank=True, related_name='enseignants', help_text="Cycles auxquels l'enseignant est habituellement affilié")

    def __str__(self):
        return self.user.get_full_name()

