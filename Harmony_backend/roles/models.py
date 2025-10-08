# roles/models.py
from django.db import models

class Permission(models.Model):
    """
    Représente une permission spécifique dans le système.
    Exemple : 'Peut saisir les notes', 'Peut valider les matières'.
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=50, unique=True)  # Pour usage interne (ex: 'can_grade')

    class Meta:
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"

    def __str__(self):
        return self.name


class Role(models.Model):
    """
    Représente un rôle utilisateur.
    Exemple : Étudiant, Enseignant, Responsable académique, Directeur, etc.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    permissions = models.ManyToManyField(
        Permission, blank=True, related_name="roles"
    )

    class Meta:
        verbose_name = "Rôle"
        verbose_name_plural = "Rôles"

    def __str__(self):
        return self.name
