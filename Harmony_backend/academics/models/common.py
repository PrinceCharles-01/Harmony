from django.db import models
from django.conf import settings

class AnneeAcademique(models.Model):
    """
    Représente une année académique ou scolaire.
    Exemple : 2024-2025.
    """
    nom = models.CharField(max_length=9, unique=True, help_text="Format AAAA-AAAA, ex: 2024-2025")
    date_debut = models.DateField()
    date_fin = models.DateField()
    est_active = models.BooleanField(default=False, help_text="Indique si c'est l'année académique en cours")

    class Meta:
        verbose_name = "Année Académique"
        verbose_name_plural = "Années Académiques"
        ordering = ['-nom'] # Ordonner de la plus récente à la plus ancienne

    def __str__(self):
        return self.nom

class Inscription(models.Model):
    """
    Représente l'inscription d'un étudiant dans une classe pour une année donnée.
    """
    etudiant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="inscriptions")
    classe = models.ForeignKey('academics.Classe', on_delete=models.PROTECT, related_name="inscrits")
    date_inscription = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = "Inscription"
        verbose_name_plural = "Inscriptions"
        unique_together = ('etudiant', 'classe') # Un étudiant ne peut pas être inscrit deux fois dans la même classe

    def __str__(self):
        return f"{self.etudiant.username} - {self.classe}"
