from django.contrib import admin
from django.utils.html import format_html
from .models.lmd import (
    AnneeAcademique,
    Inscription,
    Filiere,
    Parcours,
    Cycle,
    Niveau,
    Semestre,
    UniteEnseignement,
    ElementConstitutif,
    Classe,
    Note,
    MaquettePedagogique,
    Departement,
    Universite,
    Faculte,
)

# Simple registration for some models
@admin.register(AnneeAcademique)
class AnneeAcademiqueAdmin(admin.ModelAdmin):
    list_display = (
        'nom', 'date_debut', 'date_fin',
        'est_active', 'prolonge',
        'statut_colore'
    )
    list_filter = ('est_active',)
    search_fields = ('nom',)
    ordering = ('-nom',)
    actions = ['rendre_active', 'cloturer_annee']
    autocomplete_fields = ('prolonge',)

    fieldsets = (
        (None, {
            'fields': ('nom', ('date_debut', 'date_fin'))
        }),
        ("Statut", {
            'fields': ('est_active', 'prolonge'),
            'description': "Définissez si cette année est active ou une prolongation d'une autre."
        }),
    )

    def statut_colore(self, obj):
        if obj.est_active:
            color = "green"
            status = "Active"
        elif obj.prolonge:
            color = "orange"
            status = "Prolongation"
        else:
            color = "gray"
            status = "Terminée"
        return format_html(f'<span style="color:{color}; font-weight:bold;">{status}</span>')
    statut_colore.short_description = "Statut"

    def rendre_active(self, request, queryset):
        """Action personnalisée : rendre une seule année active"""
        if queryset.count() != 1:
            self.message_user(request, "Veuillez sélectionner une seule année pour l'activer.", level="error")
            return
        AnneeAcademique.objects.update(est_active=False)
        annee = queryset.first()
        annee.est_active = True
        annee.save()
        self.message_user(request, f"{annee.nom} est maintenant l'année académique active.")
    rendre_active.short_description = "Activer l'année sélectionnée"

    def cloturer_annee(self, request, queryset):
        """Action pour clôturer les années sélectionnées"""
        updated = queryset.update(est_active=False)
        self.message_user(request, f"{updated} année(s) clôturée(s).")
    cloturer_annee.short_description = "Clôturer l'année académique"

admin.site.register(Filiere)
admin.site.register(Cycle)

@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ('nom', 'faculte')
    search_fields = ('nom', 'faculte__nom')
@admin.register(Niveau)
class NiveauAdmin(admin.ModelAdmin):
    search_fields = ('code', 'nom_complet')

@admin.register(Semestre)
class SemestreAdmin(admin.ModelAdmin):
    search_fields = ('niveau__nom_complet', 'numero')

@admin.register(UniteEnseignement)
class UniteEnseignementAdmin(admin.ModelAdmin):
    search_fields = ('nom', 'code')
@admin.register(MaquettePedagogique)
class MaquettePedagogiqueAdmin(admin.ModelAdmin):
    list_display = ('parcours', 'niveau', 'active')
    list_filter = ('parcours', 'niveau', 'active')
    search_fields = ('parcours__nom', 'niveau__code')
    autocomplete_fields = ('parcours', 'niveau')


@admin.register(Parcours)
class ParcoursAdmin(admin.ModelAdmin):
    list_display = ('nom', 'filiere', 'cycle')
    search_fields = ('nom', 'code', 'filiere__nom')
    list_filter = ('filiere', 'cycle')


# ModelAdmins for models that need search_fields for autocomplete
@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ('nom', 'parcours', 'semestre', 'annee_academique')
    search_fields = ('nom', 'parcours__nom', 'semestre__niveau__nom_complet', 'annee_academique__nom')
    list_filter = ('annee_academique', 'parcours', 'semestre')

@admin.register(ElementConstitutif)
class ElementConstitutifAdmin(admin.ModelAdmin):
    list_display = ('nom', 'code', 'ue', 'credits')
    search_fields = ('nom', 'code')
    list_filter = ('ue',)


# Customized admin views for models with more complexity
@admin.register(Inscription)
class InscriptionAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'classe', 'date_inscription', 'annee_academique')
    list_filter = ('classe', 'date_inscription')
    search_fields = ('etudiant__username', 'classe__nom')
    ordering = ('-date_inscription',)

    def annee_academique(self, obj):
        """Affiche automatiquement l'année académique correspondant à la classe."""
        return obj.classe.annee_academique if hasattr(obj.classe, 'annee_academique') else "—"
    annee_academique.short_description = "Année académique"

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('get_student_name', 'element_constitutif', 'note_cc', 'note_examen', 'note_finale')
    list_filter = ('inscription__classe__annee_academique', 'element_constitutif__ue')
    search_fields = ('inscription__etudiant__username', 'inscription__etudiant__first_name', 'inscription__etudiant__last_name', 'element_constitutif__nom')
    autocomplete_fields = ('inscription', 'element_constitutif')
    # readonly_fields = ('note_finale',)

    def get_readonly_fields(self, request, obj=None):
        if obj: # obj is not None, so this is a change page
            return ['note_finale', 'inscription', 'element_constitutif']
        else: # obj is None, so this is an add page
            return ['note_finale']

    def get_student_name(self, obj):
        return obj.inscription.etudiant.get_full_name() or obj.inscription.etudiant.username
    get_student_name.short_description = 'Etudiant'