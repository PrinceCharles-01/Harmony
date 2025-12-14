# lmd/models.py
from decimal import Decimal, ROUND_HALF_UP
from django.db import models, transaction
from django.core.exceptions import ValidationError
from django.conf import settings
from django.db.models import JSONField # <-- AJOUTER CET IMPORT

# ---------------------------------------------------------------------
# UTILITAIRE : arrondir Decimal à 2 décimales (méthode commune)
# ---------------------------------------------------------------------
def quantize_2(val: Decimal) -> Decimal:
    if val is None:
        return None
    return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


# ---------------------------------------------------------------------
# TENTATIVE D'IMPORT DE MODELES TRANSVERSAUX (ANNEE, INSCRIPTION) DANS common
# Si ton projet a déjà ces modèles dans "common", ils seront utilisés.
# Sinon, on définit des placeholders légers (à remplacer par tes vrais modèles).
# ---------------------------------------------------------------------
try:
    from .common import AnneeAcademique, Inscription  # noqa
except Exception:
    # Placeholders légers — en pratique remplace par tes modèles common existants.
    class AnneeAcademique(models.Model):
        nom = models.CharField(max_length=20, unique=True)
        date_debut = models.DateField(null=True, blank=True)
        date_fin = models.DateField(null=True, blank=True)
        def __str__(self):
            return self.nom

    class Inscription(models.Model):
        # Dummy : ton vrai Inscription doit lier un étudiant, une classe, une annee, etc.
        etudiant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
        classe = models.CharField(max_length=255, null=True, blank=True)
        annee_academique = models.ForeignKey(AnneeAcademique, on_delete=models.CASCADE, null=True)
        date_inscription = models.DateField(auto_now_add=True)
        def __str__(self):
            return f"{self.etudiant} - {self.annee_academique}"


# ---------------------------------------------------------------------
# PARAMETRES / SETTINGS DYNAMIQUES LMD
# - Stocke les règles modifiables via l'admin (singleton)
# - Contient valeurs par défaut « sens LMD ».
# ---------------------------------------------------------------------
class LMDSettings(models.Model):
    """
    Singleton model containing configurable parameters for the LMD rules.
    Edit in admin to change thresholds, credits, abbreviations, etc.
    """
    # Singleton enforcement will be handled in save() / manager
    credits_par_annnee_licence = models.PositiveIntegerField(default=60)
    credits_par_annee_master = models.PositiveIntegerField(default=60)
    credits_par_semestre = models.PositiveIntegerField(default=30)

    # seuils par défaut pour passage conditionnel (exemples courants)
    seuil_conditionnel_l1 = models.PositiveIntegerField(default=47, help_text="Crédits min pour passage conditionnel L1")
    seuil_conditionnel_l2 = models.PositiveIntegerField(default=38, help_text="Crédits min pour passage conditionnel L2")
    seuil_conditionnel_general = models.PositiveIntegerField(default=45)

    # règles de validation
    note_min_valid = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('10.00'))
    note_max = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('20.00'))

    # indemnité / indulgence : nombre de crédits « tolérés » d'échec avant redoublement
    credits_toleres_redoublement = models.PositiveIntegerField(default=0, help_text="Nombre de crédits d'échec tolérés (ex: administration)")

    # activation de la compensation annuelle en Licence
    compensation_annuelle_licence = models.BooleanField(default=True)

    # Nom/abréviations des niveaux par défaut (JSON-like string simple ou structure)
    abrev_niveaux = models.JSONField(default=dict, help_text='Ex: {"L1":"L1","L2":"L2","L3":"L3","M1":"M1","M2":"M2"}')

    # contrôle si la rattrapage remplace l'examen seulement (True), ou remplace la moyenne globale (False)
    rattrapage_remplace_examen = models.BooleanField(default=True,
                                                      help_text="Si True: rattrapage remplace uniquement examen. Sinon: remplace moyenne entière quand meilleur.")

    # singleton utilities
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Paramètres LMD"
        verbose_name_plural = "Paramètres LMD"

    def clean(self):
        # cohérences basiques
        if self.note_min_valid < 0 or self.note_min_valid > self.note_max:
            raise ValidationError("note_min_valid doit être entre 0 et note_max.")
        if self.credits_par_semestre * 2 != self.credits_par_annnee_licence and self.credits_par_annnee_licence != 60:
            # message informatif ; on n'impose pas strict
            pass

    def save(self, *args, **kwargs):
        # assurer l'unicité (singleton)
        if not self.pk and LMDSettings.objects.exists():
            raise ValidationError("Il ne peut y avoir qu'une instance de LMDSettings (singleton).")
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        """
        Retourne l'instance unique, ou la crée avec defaults si n'existe pas.
        """
        inst, _ = cls.objects.get_or_create(pk=1) # Use pk=1 to ensure it's always the same instance
        return inst

    def __str__(self):
        return "Paramètres LMD (singleton)"


# ---------------------------------------------------------------------
# HIERARCHIE ADMINISTRATIVE ET PEDAGOGIQUE
# ---------------------------------------------------------------------
class Universite(models.Model):
    nom = models.CharField(max_length=255, unique=True)
    sigle = models.CharField(max_length=20, null=True, blank=True)
    def __str__(self):
        return self.nom

class Faculte(models.Model):
    universite = models.ForeignKey(Universite, on_delete=models.CASCADE, related_name="facultes")
    nom = models.CharField(max_length=255)
    def __str__(self):
        return f"{self.nom} ({self.universite.sigle or self.universite.nom})"

class Departement(models.Model):
    faculte = models.ForeignKey(Faculte, on_delete=models.CASCADE, related_name="departements")
    nom = models.CharField(max_length=255)
    def __str__(self):
        return f"{self.nom} ({self.faculte.nom})"

class Filiere(models.Model):
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE, related_name="filieres", null=True, blank=True)
    nom = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    def __str__(self):
        return f"{self.code} - {self.nom}"

class Cycle(models.Model):
    nom = models.CharField(max_length=50)  # Licence, Master, Doctorat
    code = models.CharField(max_length=5, unique=True)
    duree_annees = models.PositiveIntegerField(default=3, help_text="Durée théorique du cycle (en années)")
    def __str__(self):
        return self.nom

class Parcours(models.Model):
    filiere = models.ForeignKey(Filiere, on_delete=models.CASCADE, related_name="parcours")
    cycle = models.ForeignKey(Cycle, on_delete=models.CASCADE, related_name="parcours", null=True, blank=True)
    nom = models.CharField(max_length=255)
    def __str__(self):
        return f"{self.nom} ({self.filiere.code})"

class Niveau(models.Model):
    cycle = models.ForeignKey(Cycle, on_delete=models.CASCADE, related_name="niveaux")
    numero = models.PositiveIntegerField(help_text="1 pour L1, 2 pour L2, etc.")
    code = models.CharField(max_length=10, help_text="Ex: L1, L2, M1", unique=False, null=True, blank=True)
    nom = models.CharField(max_length=80, help_text="Nom affiché ex: Licence 1", null=True, blank=True)
    credits_theoriques = models.PositiveIntegerField(default=60)
    def __str__(self):
        return f"{self.code} - {self.nom}"


class Classe(models.Model):
    nom = models.CharField(max_length=100, help_text='Ex: Groupe A, Groupe 1, Amphi 1')
    annee_academique = models.ForeignKey('AnneeAcademique', on_delete=models.PROTECT)
    parcours = models.ForeignKey('Parcours', on_delete=models.PROTECT)
    semestre = models.ForeignKey('Semestre', on_delete=models.PROTECT, null=True)

    class Meta:
        unique_together = ('annee_academique', 'parcours', 'semestre', 'nom')
        verbose_name = 'Classe'
        verbose_name_plural = 'Classes'

    def __str__(self):
        if self.semestre and self.semestre.niveau:
            return f"{self.parcours} {self.semestre.niveau} - {self.nom} ({self.annee_academique})"
        return f"{self.parcours} - {self.nom} ({self.annee_academique})"


# ---------------------------------------------------------------------
# MODELES DE MAQUETTE ET UE
# - UniteEnseignementModele : le "plan" réutilisable (maquette)
# - MaquettePedagogique : lien parcours + niveau + liste d'UE modèles
# - UniteEnseignement : instance concrète d'UE pour une année/semestre
# ---------------------------------------------------------------------
class UniteEnseignementModele(models.Model):
    """
    UE modèle (dans la maquette) : sert de template / référence, non liée à une année.
    """
    code = models.CharField(max_length=50)
    nom = models.CharField(max_length=255)
    credits = models.PositiveIntegerField(default=0)
    obligatoire = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('code',)

    def __str__(self):
        return f"{self.code} - {self.nom}"


class MaquettePedagogique(models.Model):
    parcours = models.ForeignKey(Parcours, on_delete=models.CASCADE, related_name="maquettes", null=True, blank=True)
    niveau = models.ForeignKey(Niveau, on_delete=models.CASCADE, related_name="maquettes", null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    ues_modele = models.ManyToManyField(UniteEnseignementModele, related_name="maquettes")
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('parcours', 'niveau')

    def __str__(self):
        return f"Maquette {self.parcours} - {self.niveau}"


class Semestre(models.Model):
    niveau = models.ForeignKey(Niveau, on_delete=models.CASCADE, related_name="semestres")
    numero = models.PositiveIntegerField(help_text="1 pour S1, 2 pour S2")
    annee_academique = models.ForeignKey(AnneeAcademique, on_delete=models.CASCADE, related_name="semestres", null=True, blank=True)
    # on relie des UE concrètes au semestre
    class Meta:
        unique_together = ('niveau', 'numero', 'annee_academique')
    def __str__(self):
        return f"{self.niveau.code} - S{self.numero} ({self.annee_academique.nom if self.annee_academique else 'N/A'})"


class UniteEnseignement(models.Model):
    """
    UE concrète — liée à un semestre précis (année académique).
    """
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE, related_name="ues", null=True, blank=True)
    modele = models.ForeignKey(UniteEnseignementModele, on_delete=models.SET_NULL, null=True, blank=True)
    code = models.CharField(max_length=50)
    nom = models.CharField(max_length=255)
    credits = models.PositiveIntegerField(default=0)
    coefficient = models.PositiveIntegerField(default=1, help_text="Coefficient global de l'UE dans le semestre")
    def __str__(self):
        return f"{self.code} - {self.nom} ({self.semestre})"

    class Meta:
        unique_together = ('semestre', 'code')


# ---------------------------------------------------------------------
# ELEMENT CONSTITUTIF (Matière) et NOTES
# - EC a coeff CC / coeff Examen ; somme doit être 1.00
# - Note : note_cc (contrôle continu), note_examen, note_rattrapage, note_finale
# - Méthodes: calculer_note_finale(), est_validee()
# ---------------------------------------------------------------------
class ElementConstitutif(models.Model):
    ue = models.ForeignKey(UniteEnseignement, on_delete=models.CASCADE, related_name="ecs")
    code = models.CharField(max_length=50)
    nom = models.CharField(max_length=255)
    credits = models.PositiveIntegerField(default=0)
    coeff_cc = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.30'))
    coeff_examen = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.70'))
    volume_horaire_forfaitaire = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('30.00'), help_text="Volume horaire forfaitaire pour cette matière")
    # possibilité d'ajouter des flags (obligatoire, contrôle continu absent, etc.)
    obligatoire = models.BooleanField(default=True)
    # Nouveaux champs
    tags = JSONField(default=list, blank=True, help_text="Liste de tags décrivant le contenu de la matière (ex: ['Algèbre', 'Analyse financière'])")
    cycles = models.ManyToManyField('Cycle', blank=True, related_name='elements_constitutifs', help_text="Cycles dans lesquels cette matière est généralement enseignée")

    class Meta:
        unique_together = ('ue', 'code')

    def clean(self):
        # Vérifier la somme des coefficients
        if quantize_2(self.coeff_cc + self.coeff_examen) != Decimal("1.00"):
            raise ValidationError("Les coefficients coeff_cc + coeff_examen doivent faire 1.00")

    def __str__(self):
        return f"{self.ue} :: {self.code} - {self.nom}"


class Note(models.Model):
    inscription = models.ForeignKey(Inscription, on_delete=models.CASCADE, related_name="notes")
    element_constitutif = models.ForeignKey(ElementConstitutif, on_delete=models.CASCADE, related_name="notes")
    note_cc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    note_examen = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    note_rattrapage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    note_finale = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    date_saisie = models.DateTimeField(auto_now_add=True)
    # statut de la note (facultatif) : validée, en attente, rattrapage...
    STATUTS = (
        ('draft', 'Brouillon'),
        ('normal', 'Normale'),
        ('rattrapage', 'Rattrapage'),
        ('final', 'Finalisée'),
    )
    statut = models.CharField(max_length=20, choices=STATUTS, default='draft')

    class Meta:
        unique_together = ('inscription', 'element_constitutif')

    def clean(self):
        # validation simple des bornes
        settings_lmd = LMDSettings.load()
        for f in ('note_cc', 'note_examen', 'note_rattrapage'):
            v = getattr(self, f)
            if v is not None:
                if v < 0 or v > settings_lmd.note_max:
                    raise ValidationError({f: f"Valeur doit être entre 0 et {settings_lmd.note_max}."})

    def calculer_note_finale(self):
        """
        Logique:
        - Si note_rattrapage présente et meilleure -> applique selon param LMDSettings.rattrapage_remplace_examen
        - Sinon, si CC + Examen présents -> moyenne pondérée
        - Sinon -> None (incomplète)
        """
        settings_lmd = LMDSettings.load()
        ec = self.element_constitutif

        note_cc_val = Decimal(self.note_cc) if self.note_cc is not None else None
        note_ex_val = Decimal(self.note_examen) if self.note_examen is not None else None
        note_rat = Decimal(self.note_rattrapage) if self.note_rattrapage is not None else None

        # cas rattrapage
        if note_rat is not None:
            if settings_lmd.rattrapage_remplace_examen:
                # remplace l'examen uniquement -> recompute moyenne
                if note_cc_val is not None:
                    final = (note_cc_val * ec.coeff_cc) + (note_rat * ec.coeff_examen)
                else:
                    # si pas de CC, la note finale est la rattrapage (si coeff_cc == 0)
                    if ec.coeff_cc == Decimal('0'):
                        final = note_rat
                    else:
                        final = None
            else:
                # rattrapage remplace la moyenne entière si meilleure
                # on compare la moyenne normale vs rattrapage seule
                normal = None
                if note_cc_val is not None and note_ex_val is not None:
                    normal = (note_cc_val * ec.coeff_cc) + (note_ex_val * ec.coeff_examen)
                # si normal absent mais rattrapage présent -> on prend rattrapage
                if normal is None:
                    final = note_rat
                else:
                    # prendre la meilleure des deux approches
                    final = note_rat if note_rat > normal else normal
        else:
            # pas de rattrapage
            if note_cc_val is not None and note_ex_val is not None:
                final = (note_cc_val * ec.coeff_cc) + (note_ex_val * ec.coeff_examen)
            elif note_cc_val is not None:
                # si examen absent, et coeff_examen == 0 -> cc suffit
                if ec.coeff_examen == Decimal('0'):
                    final = note_cc_val
                else:
                    final = None
            elif note_ex_val is not None:
                if ec.coeff_cc == Decimal('0'):
                    final = note_ex_val
                else:
                    final = None
            else:
                final = None

        self.note_finale = quantize_2(Decimal(final)) if final is not None else None
        return self.note_finale

    def save(self, *args, **kwargs):
        self.calculer_note_finale()
        super().save(*args, **kwargs)

    def est_validee(self):
        settings_lmd = LMDSettings.load()
        if self.note_finale is None:
            return False
        return Decimal(self.note_finale) >= settings_lmd.note_min_valid

    def __str__(self):
        etu = getattr(self.inscription, 'etudiant', None)
        nom = getattr(etu, 'username', str(etu)) if etu else "Étudiant"
        return f"{nom} - {self.element_constitutif.code}: {self.note_finale or 'N/A'}"


# ---------------------------------------------------------------------
# Validation d'une UE pour une inscription donnée (capitalisation)
# - On calcule la moyenne des EC appartenant à cette UE pour l'inscription
# - Si moyenne >= seuil -> UE validée, credits acquis
# ---------------------------------------------------------------------
class ValidationUE(models.Model):
    inscription = models.ForeignKey(Inscription, on_delete=models.CASCADE, related_name="validations_ue")
    ue = models.ForeignKey(UniteEnseignement, on_delete=models.CASCADE, related_name="validations")
    moyenne = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    validee = models.BooleanField(default=False)
    credits_obtenus = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('inscription', 'ue')

    def calculer(self):
        notes = Note.objects.filter(inscription=self.inscription, element_constitutif__ue=self.ue)
        if not notes.exists():
            self.moyenne = None
            self.validee = False
            self.credits_obtenus = 0
            return self.save()
        # on ne prend que les note_finale non nulles
        notes_finales = [n.note_finale for n in notes if n.note_finale is not None]
        if not notes_finales:
            self.moyenne = None
            self.validee = False
            self.credits_obtenus = 0
            return self.save()
        moyenne = sum(Decimal(n) for n in notes_finales) / Decimal(len(notes_finales))
        moyenne = quantize_2(moyenne)
        self.moyenne = moyenne
        settings_lmd = LMDSettings.load()
        if moyenne >= settings_lmd.note_min_valid:
            self.validee = True
            self.credits_obtenus = self.ue.credits
        else:
            self.validee = False
            self.credits_obtenus = 0
        self.save()

    def __str__(self):
        return f"{self.inscription} - {self.ue} : {'validée' if self.validee else 'non validée'}"


# ---------------------------------------------------------------------
# Fonctions utilitaires pour calculer moyennes / credits / passage
# Ces fonctions supposent l'existence d'Inscription lié à une ANNEE / PARCOURS / etc.
# ---------------------------------------------------------------------
class CalculLMD:
    @staticmethod
    def credits_acquis_inscription(inscription: Inscription) -> int:
        """Somme des crédits acquis par une inscription (UE validées)."""
        vals = ValidationUE.objects.filter(inscription=inscription, validee=True)
        return sum(v.credits_obtenus for v in vals)

    @staticmethod
    def moyenne_ue(inscription: Inscription, ue: UniteEnseignement) -> Decimal:
        """Retourne la moyenne (Decimal) pour l'inscription sur cette UE."""
        v = ValidationUE.objects.filter(inscription=inscription, ue=ue).first()
        if v:
            return v.moyenne
        # fallback : calculer à la volée
        notes = Note.objects.filter(inscription=inscription, element_constitutif__ue=ue)
        notes_finales = [n.note_finale for n in notes if n.note_finale is not None]
        if not notes_finales:
            return None
        moyenne = sum(Decimal(n) for n in notes_finales) / Decimal(len(notes_finales))
        return quantize_2(moyenne)

    @staticmethod
    def moyenne_semestre(inscription: Inscription, semestre: Semestre) -> Decimal:
        """Moyenne pondérée d'un semestre pour une inscription (pondération via UE.coefficient)."""
        ues = UniteEnseignement.objects.filter(semestre=semestre)
        total_coef = Decimal(0)
        total_note = Decimal(0)
        for ue in ues:
            # chercher validation ou moyenne ue en direct
            moy = CalculLMD.moyenne_ue(inscription, ue)
            if moy is None:
                continue
            coef = Decimal(ue.coefficient or 1)
            total_coef += coef
            total_note += Decimal(moy) * coef
        if total_coef == 0:
            return None
        moyenne = total_note / total_coef
        return quantize_2(moyenne)

    @staticmethod
    def moyenne_annuelle(inscription: Inscription, niveau: Niveau, annee: AnneeAcademique) -> Decimal:
        """Moyenne annuelle = moyenne des 2 semestres (pondérée par crédits ou coefficients)."""
        sems = Semestre.objects.filter(niveau=niveau, annee_academique=annee)
        notes = []
        coefs = []
        for s in sems:
            moy = CalculLMD.moyenne_semestre(inscription, s)
            if moy is None:
                continue
            # pondération par credits (ou 1)
            credits = sum(ue.credits for ue in UniteEnseignement.objects.filter(semestre=s))
            if credits == 0:
                credits = 1
            notes.append(Decimal(moy) * Decimal(credits))
            coefs.append(Decimal(credits))
        if not notes or sum(coefs) == 0:
            return None
        moyenne = sum(notes) / sum(coefs)
        return quantize_2(moyenne)

    @staticmethod
    def peut_passer(inscription: Inscription, niveau_cible: Niveau = None) -> dict:
        """
        Détermine si l'inscription (étudiant pour l'année) peut passer automatiquement / conditionnellement / redoubler
        Retourne dict: {'statut': 'passe'|'conditionnel'|'redouble', 'raison': str, 'credits_acquis': int}
        """
        settings_lmd = LMDSettings.load()
        credits = CalculLMD.credits_acquis_inscription(inscription)
        # chercher le niveau courant depuis l'inscription (si dispo) sinon param niveau_cible
        # on suppose que Inscription contient référence au niveau / parcours; sinon l'appelant fournira info
        # Ici, on va utiliser un heuristique simple : inscription.classe -> niveau -> parcours (à adapter)
        # Pour robustesse, on laisse la logique de récupération flexible.
        result = {'credits_acquis': credits}
        # On applique règles générales basées sur credits_par_annnee_licence
        credits_par_annee = settings_lmd.credits_par_annnee_licence
        if credits >= credits_par_annee:
            result.update({'statut': 'passe', 'raison': f"Crédits acquis >= {credits_par_annee}"})
            return result

        # Conditionnel : si crédits >= seuil_conditionnel_general
        seuil_general = settings_lmd.seuil_conditionnel_general
        if credits >= seuil_general:
            result.update({'statut': 'conditionnel', 'raison': f"Crédits >= seuil conditionnel ({seuil_general})"})
            return result

        # Tolérence admin (credits tolérés)
        tol = settings_lmd.credits_toleres_redoublement
        if credits + tol >= credits_par_annee:
            result.update({'statut': 'conditionnel',
                           'raison': f"Crédits + tolérance admin >= {credits_par_annee} (tolérance {tol})"})
            return result

        # sinon redouble
        result.update({'statut': 'redouble', 'raison': "Crédits insuffisants pour passer"})
        return result


# ---------------------------------------------------------------------
# ADMIN / MANAGER: utilitaires pour créer UE à partir de maquette pour une année
# ---------------------------------------------------------------------
class MaquetteManager(models.Manager):
    def generer_ues_pour_annee(self, maquette: MaquettePedagogique, annee: AnneeAcademique):
        """
        Génère les UniteEnseignement concrètes à partir d'une maquette pour l'année fournie.
        Idempotent : ne recrée pas si existe.
        """
        created = []
        # trouver ou créer semestres correspondants
        niveau = maquette.niveau
        for modele in maquette.ues_modele.all():
            # heuristique : on doit associer le modele à un semestre précis
            # Pour la simplicité ici on affecte par numéro de semestres pair/impair selon credits (à affiner)
            # Tu peux étendre pour stocker semestre target dans UniteEnseignementModele
            sem_num = 1 if modele.credits <= 30 else 2
            semestre, _ = Semestre.objects.get_or_create(niveau=niveau, numero=sem_num, annee_academique=annee)
            ue, created_flag = UniteEnseignement.objects.get_or_create(
                semestre=semestre, code=modele.code,
                defaults={'nom': modele.nom, 'credits': modele.credits, 'modele': modele}
            )
            if created_flag:
                created.append(ue)
        return created

# attacher le manager si besoin
MaquettePedagogique.add_to_class('objects_manager', MaquetteManager())


# ---------------------------------------------------------------------
# Signals et helpers (optionnel)
# - on peut déclencher recalcul automatique des ValidationUE quand Note.save()
#   mais attention aux boucles et performances ; implémentation basique ci-dessous.
# ---------------------------------------------------------------------
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Note)
def on_note_saved_recalculate_ue(sender, instance: Note, created, **kwargs):
    """
    Lorsqu'une note est sauvegardée, on recalcule la ValidationUE correspondante.
    """
    try:
        inscription = instance.inscription
        ue = instance.element_constitutif.ue
        v, _ = ValidationUE.objects.get_or_create(inscription=inscription, ue=ue)
        v.calculer()
    except Exception:
        # Ne jamais laisser une erreur de recalcul casser la transaction principale.
        pass
