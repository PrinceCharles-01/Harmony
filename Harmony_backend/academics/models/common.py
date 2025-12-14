from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class AnneeAcademique(models.Model):
    """
    Représente une année académique.
    Peut éventuellement prolonger une autre année (ex: prolongation de 2024-2025).
    """
    nom = models.CharField(
        max_length=9,
        unique=True,
        help_text=_("Format AAAA-AAAA, ex: 2024-2025")
    )
    date_debut = models.DateField()
    date_fin = models.DateField()
    est_active = models.BooleanField(default=False)
    est_prolongation = models.BooleanField(
        default=False,
        help_text=_("Indique si cette année est une prolongation d'une autre.")
    )
    prolonge = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prolongations',
        help_text=_("Année académique dont celle-ci est une prolongation.")
    )

    class Meta:
        verbose_name = _("Année Académique")
        verbose_name_plural = _("Années Académiques")
        ordering = ['-nom']

    def clean(self):
        if self.date_fin <= self.date_debut:
            raise ValidationError(_("La date de fin doit être postérieure à la date de début."))

        if self.est_prolongation and not self.prolonge:
            raise ValidationError(_("Une année de prolongation doit être liée à une année principale."))

        if self.prolonge and self.prolonge == self:
            raise ValidationError(_("Une année ne peut pas se prolonger elle-même."))

    def save(self, *args, **kwargs):
        if self.est_active:
            AnneeAcademique.objects.exclude(pk=self.pk).update(est_active=False)
        super().save(*args, **kwargs)

    @property
    def annee_racine(self):
        """Retourne l'année principale associée à cette année (si prolongation)."""
        return self.prolonge or self

    def __str__(self):
        suffix = " (Prolongation)" if self.est_prolongation else ""
        return f"{self.nom}{suffix}"


class Inscription(models.Model):
    """
    Représente l'inscription d'un étudiant dans une classe
    pour une année académique donnée.
    """
    etudiant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="inscriptions"
    )
    classe = models.ForeignKey(
        'academics.Classe',
        on_delete=models.PROTECT,
        related_name="inscrits"
    )
    annee_academique = models.ForeignKey(
        AnneeAcademique,
        on_delete=models.PROTECT,
        related_name="inscriptions",
        null=True,
        blank=True
    )
    date_inscription = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = _("Inscription")
        verbose_name_plural = _("Inscriptions")
        unique_together = ('etudiant', 'classe', 'annee_academique')
        ordering = ['-date_inscription']

    def __str__(self):
        return f"{self.etudiant.username} - {self.classe} ({self.annee_academique})"


