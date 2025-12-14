
from django.db import models
from .lmd import ElementConstitutif, Classe
from .common import AnneeAcademique
from users.models import Enseignant

class Contrainte(models.Model):
    """
    Représente une contrainte pour l'algorithme de planification.
    """
    TYPE_CONTRAINTE_CHOICES = [
        ('JOUR_BLOQUE', 'Jour entier bloqué (férié, etc.)'),
        ('INDISPONIBILITE_ENSEIGNANT', 'Indisponibilité ponctuelle d\'un enseignant'),
        ('HEURES_MAX_JOUR_ENSEIGNANT', 'Max heures/jour pour un enseignant'),
    ]

    nom = models.CharField(max_length=255)
    type_contrainte = models.CharField(max_length=50, choices=TYPE_CONTRAINTE_CHOICES)
    
    # Peut s'appliquer à un enseignant spécifique
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE, null=True, blank=True)

    # Période de validité de la contrainte
    date_debut = models.DateTimeField(null=True, blank=True, help_text="Début de la période de contrainte")
    date_fin = models.DateTimeField(null=True, blank=True, help_text="Fin de la période de contrainte")

    # Pour les contraintes récurrentes (ex: tous les lundis)
    jour_semaine = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(7)], help_text="0=Lundi, 1=Mardi, ..., 6=Dimanche")

    # Valeurs flexibles (ex: {'heures_max': 4})
    valeur_json = models.JSONField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.get_type_contrainte_display()}: {self.nom}"

class Salle(models.Model):
    """
    Représente une salle de cours avec ses propriétés.
    """
    nom = models.CharField(max_length=100, unique=True)
    capacite = models.PositiveIntegerField(default=0)
    TYPE_SALLE_CHOICES = [
        ('AMPHI', 'Amphithéâtre'),
        ('LABO', 'Laboratoire'),
        ('INFO', 'Salle Informatique'),
        ('TD', 'Salle de TD'),
        ('AUTRE', 'Autre'),
    ]
    type_salle = models.CharField(max_length=10, choices=TYPE_SALLE_CHOICES, default='TD')

    def __str__(self):
        return self.nom

class Cours(models.Model):
    """
    Associe une matière, un enseignant et une classe pour une année académique.
    Définit le volume horaire total attendu.
    """
    element_constitutif = models.ForeignKey(ElementConstitutif, on_delete=models.PROTECT, related_name="cours")
    enseignant = models.ForeignKey(Enseignant, on_delete=models.PROTECT, related_name="cours")
    classe = models.ForeignKey(Classe, on_delete=models.PROTECT, related_name="cours", null=True, blank=True)
    annee_academique = models.ForeignKey(AnneeAcademique, on_delete=models.PROTECT, related_name="cours")
    volume_horaire_total = models.DecimalField(max_digits=5, decimal_places=2, help_text="Volume horaire total prévu pour ce cours (ex: 40.00)")
    description = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('element_constitutif', 'classe', 'annee_academique')
        verbose_name = "Cours"
        verbose_name_plural = "Cours"

    def save(self, *args, **kwargs):
        if not self.volume_horaire_total and self.element_constitutif:
            self.volume_horaire_total = self.element_constitutif.volume_horaire_forfaitaire
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.element_constitutif.nom} - {self.classe.nom if self.classe else 'N/A'} ({self.annee_academique.nom})"

class SessionCours(models.Model):
    """
    Représente une session de cours unique (un événement dans le calendrier).
    """
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name="sessions")
    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField()
    salle = models.ForeignKey(Salle, on_delete=models.SET_NULL, blank=True, null=True, help_text="Salle de cours")
    TYPE_SESSION_CHOICES = [
        ('CM', 'Cours Magistral'),
        ('TD', 'Travaux Dirigés'),
        ('TP', 'Travaux Pratiques'),
        ('Examen', 'Examen'),
        ('Autre', 'Autre'),
    ]
    type_session = models.CharField(max_length=10, choices=TYPE_SESSION_CHOICES, default='CM')
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['date_debut']
        verbose_name = "Session de Cours"
        verbose_name_plural = "Sessions de Cours"

    def __str__(self):
        return f"{self.cours} - {self.date_debut.strftime('%Y-%m-%d %H:%M')}"

    @property
    def duree(self):
        return self.date_fin - self.date_debut
