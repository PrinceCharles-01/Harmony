from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal

# ----------------------------------------------------------------------------
# Modèles de base pour la structure académique LMD
# ----------------------------------------------------------------------------

class Filiere(models.Model):
    nom = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)
    class Meta:
        verbose_name = "Filière"
        verbose_name_plural = "Filières"
    def __str__(self):
        return self.nom

class Parcours(models.Model):
    filiere = models.ForeignKey(Filiere, on_delete=models.CASCADE, related_name="parcours")
    nom = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    class Meta:
        verbose_name = "Parcours"
        verbose_name_plural = "Parcours"
        unique_together = ('filiere', 'nom')
    def __str__(self):
        return f"{self.filiere.nom} - {self.nom}"

class Cycle(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True, help_text="Ex: L, M, D")
    class Meta:
        verbose_name = "Cycle"
        verbose_name_plural = "Cycles"
    def __str__(self):
        return self.nom

class Niveau(models.Model):
    cycle = models.ForeignKey(Cycle, on_delete=models.CASCADE, related_name="niveaux")
    numero = models.PositiveIntegerField(help_text="Ex: 1 pour L1, 2 pour L2")
    nom_complet = models.CharField(max_length=100, help_text="Ex: Licence 1, Master 2")
    class Meta:
        verbose_name = "Niveau"
        verbose_name_plural = "Niveaux"
        unique_together = ('cycle', 'numero')
    def __str__(self):
        return self.nom_complet

class Semestre(models.Model):
    niveau = models.ForeignKey(Niveau, on_delete=models.CASCADE, related_name="semestres")
    numero = models.PositiveIntegerField(help_text="Ex: 1 pour S1, 2 pour S2")
    ues = models.ManyToManyField('UniteEnseignement', through='MaquettePedagogique', related_name='semestres')
    class Meta:
        verbose_name = "Semestre"
        verbose_name_plural = "Semestres"
        unique_together = ('niveau', 'numero')
    def __str__(self):
        return f"{self.niveau} - Semestre {self.numero}"

class UniteEnseignement(models.Model):
    nom = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    credits = models.PositiveIntegerField(default=0, help_text="Nombre de crédits ECTS pour cette UE")
    class Meta:
        verbose_name = "Unité d'Enseignement (UE)"
        verbose_name_plural = "Unités d'Enseignement (UE)"
    def __str__(self):
        return f"{self.code} - {self.nom}"

class MaquettePedagogique(models.Model):
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE)
    ue = models.ForeignKey(UniteEnseignement, on_delete=models.CASCADE)
    coefficient = models.PositiveIntegerField(default=1)
    class Meta:
        verbose_name = "Maquette Pédagogique"
        verbose_name_plural = "Maquettes Pédagogiques"
        unique_together = ('semestre', 'ue')
    def __str__(self):
        return f"{self.semestre} - {self.ue} (Coeff: {self.coefficient})"

class ElementConstitutif(models.Model):
    ue = models.ForeignKey(UniteEnseignement, on_delete=models.CASCADE, related_name="ecs")
    nom = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    credits = models.PositiveIntegerField(default=0, help_text="Nombre de crédits ECTS pour cette matière")
    coeff_cc = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('0.3'), help_text="Coefficient du Contrôle Continu")
    coeff_examen = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('0.7'), help_text="Coefficient de l'Examen Final")
    class Meta:
        verbose_name = "Élément Constitutif (EC)"
        verbose_name_plural = "Éléments Constitutifs (EC)"
    def clean(self):
        if self.coeff_cc + self.coeff_examen != Decimal('1.0'):
            raise ValidationError("La somme des coefficients (CC et Examen) doit être égale à 1.")
    def __str__(self):
        return f"{self.code} - {self.nom}"

class Classe(models.Model):
    nom = models.CharField(max_length=100, help_text="Ex: Groupe A, Groupe 1, Amphi 1")
    annee_academique = models.ForeignKey('academics.AnneeAcademique', on_delete=models.PROTECT)
    parcours = models.ForeignKey(Parcours, on_delete=models.PROTECT)
    niveau = models.ForeignKey(Niveau, on_delete=models.PROTECT)
    class Meta:
        verbose_name = "Classe"
        verbose_name_plural = "Classes"
        unique_together = ('annee_academique', 'parcours', 'niveau', 'nom')
    def __str__(self):
        return f"{self.parcours} {self.niveau} - {self.nom} ({self.annee_academique})"

class Note(models.Model):
    inscription = models.ForeignKey('academics.Inscription', on_delete=models.CASCADE, related_name="notes")
    element_constitutif = models.ForeignKey(ElementConstitutif, on_delete=models.CASCADE, related_name="notes")
    note_cc = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True, help_text="Note de Contrôle Continu")
    note_examen = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True, help_text="Note d'Examen Final")
    note_finale = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True, help_text="Note finale calculée")
    date_saisie = models.DateField(auto_now_add=True)
    class Meta:
        verbose_name = "Note"
        verbose_name_plural = "Notes"
        unique_together = ('inscription', 'element_constitutif')
    def __str__(self):
        return f"Note de {self.inscription.etudiant.username} pour {self.element_constitutif.code}: {self.note_finale or 'N/A'}"

    def calculate_final_note(self):
        self.note_finale = None
        ec = self.element_constitutif
        
        note_cc_val = self.note_cc if self.note_cc is not None else Decimal('0.0')
        note_examen_val = self.note_examen if self.note_examen is not None else Decimal('0.0')

        # Cas 1: Les deux notes sont présentes
        if self.note_cc is not None and self.note_examen is not None:
            self.note_finale = (note_cc_val * ec.coeff_cc) + (note_examen_val * ec.coeff_examen)
        # Cas 2: Seule la note de CC est présente
        elif self.note_cc is not None:
            # Si l'examen compte pour 0, la note finale est le CC
            if ec.coeff_examen == Decimal('0.0'):
                self.note_finale = note_cc_val
            # Sinon, la note finale ne peut être calculée
            else:
                self.note_finale = None 
        # Cas 3: Seule la note d'examen est présente
        elif self.note_examen is not None:
            # Si le CC compte pour 0, la note finale est l'examen
            if ec.coeff_cc == Decimal('0.0'):
                self.note_finale = note_examen_val
            # Sinon, la note finale ne peut être calculée
            else:
                self.note_finale = None

    def save(self, *args, **kwargs):
        self.calculate_final_note()
        super().save(*args, **kwargs)
