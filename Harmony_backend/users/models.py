from django.contrib.auth.models import AbstractUser
from django.db import models
from roles.models import Role

# ---------------------------
# UTILISATEUR PERSONNALISÉ
# ---------------------------

class CustomUser(AbstractUser):
    """
    Utilisateur personnalisé basé sur AbstractUser.
    Permet d'associer chaque utilisateur à un ou plusieurs rôles.
    """
    roles = models.ManyToManyField(
        Role,
        blank=True,
        related_name="users",
        help_text="Rôles attribués à l'utilisateur"
    )
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    matricule = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        role_names = ", ".join([role.name for role in self.roles.all()])
        return f"{self.username} ({role_names if role_names else 'Aucun rôle'})"

    # ---------------------------
    # Gestion des permissions
    # ---------------------------

    def has_permission(self, perm_code: str) -> bool:
        """
        Vérifie si l'utilisateur possède une permission spécifique via ses rôles.
        """
        if not self.roles.exists():
            return False
        # Vérifie si au moins un des rôles de l'utilisateur a la permission
        return self.roles.filter(permissions__code=perm_code).exists()

    def has_perm(self, perm: str, obj=None) -> bool:
        """
        Surcharge de la méthode native Django pour intégrer notre logique de permissions personnalisées.
        Exemple d'appel attendu : "roles.ajouter_note"
        """
        # Superuser : accès total
        if self.is_active and self.is_superuser:
            return True

        # Vérification des permissions personnalisées
        try:
            # On ne vérifie que si le format est 'app_label.code'
            app_label, code = perm.split('.')
            return self.has_permission(code)
        except ValueError:
            pass  # Si le format n'est pas bon, on passe au fallback

        # Sinon, fallback sur les permissions classiques Django
        return super().has_perm(perm, obj)

    def has_module_perms(self, app_label: str) -> bool:
        """
        Vérifie si l'utilisateur a des permissions pour une application donnée.
        """
        if self.is_active and self.is_superuser:
            return True

        if not self.roles.exists():
            return False

        # Vérifie si l'utilisateur a au moins une permission dans l'application donnée
        return self.roles.filter(permissions__isnull=False).exists()
