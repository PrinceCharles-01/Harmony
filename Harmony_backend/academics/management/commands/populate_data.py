from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from academics.models import (
    AnneeAcademique,
    Universite,
    Faculte,
    Departement,
    Filiere,
    Cycle,
    Niveau,
    Parcours,
    Semestre,
    UniteEnseignementModele,
    MaquettePedagogique,
    UniteEnseignement,
    ElementConstitutif,
    Classe,
    Inscription,
    Note,
    LMDSettings,
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with sample academic data.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting data population...'))

        # 1. Get or create LMDSettings
        lmd_settings = LMDSettings.load()
        self.stdout.write(self.style.SUCCESS('Loaded or created LMDSettings.'))

        # 2. Get or create AnneeAcademique
        annee_active, created = AnneeAcademique.objects.get_or_create(
            nom='2024-2025',
            defaults={
                'date_debut': timezone.localdate(timezone.now()).replace(month=9, day=1),
                'date_fin': timezone.localdate(timezone.now()).replace(month=8, day=31, year=2025),
                'est_active': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created active academic year: {annee_active.nom}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Academic year {annee_active.nom} already exists.'))
            if not annee_active.est_active:
                annee_active.est_active = True
                annee_active.save()
                self.stdout.write(self.style.SUCCESS(f'Set {annee_active.nom} as active.'))

        # 3. Universite
        universite, created = Universite.objects.get_or_create(
            nom='Université de l\'Excellence',
            defaults={'sigle': 'UNIV-EX'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created University: {universite.nom}'))

        # 4. Faculte
        faculte, created = Faculte.objects.get_or_create(
            nom='Faculté des Sciences et Technologies',
            defaults={'universite': universite}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Faculty: {faculte.nom}'))

        # 5. Departement
        departement, created = Departement.objects.get_or_create(
            nom='Département Informatique',
            defaults={'faculte': faculte}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Department: {departement.nom}'))

        # 6. Filiere
        filiere, created = Filiere.objects.get_or_create(
            code='INFO',
            defaults={'nom': 'Informatique', 'departement': departement}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Filiere: {filiere.nom}'))

        # 7. Cycles
        cycle_licence, created = Cycle.objects.get_or_create(
            code='L',
            defaults={'nom': 'Licence', 'duree_annees': 3}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Cycle: {cycle_licence.nom}'))

        cycle_master, created = Cycle.objects.get_or_create(
            code='M',
            defaults={'nom': 'Master', 'duree_annees': 2}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Cycle: {cycle_master.nom}'))

        # 8. Niveaux
        niveau_l1, created = Niveau.objects.get_or_create(
            code='L1',
            defaults={'nom': 'Licence 1', 'cycle': cycle_licence, 'numero': 1}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Niveau: {niveau_l1.nom}'))

        niveau_l2, created = Niveau.objects.get_or_create(
            code='L2',
            defaults={'nom': 'Licence 2', 'cycle': cycle_licence, 'numero': 2}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Niveau: {niveau_l2.nom}'))

        niveau_m1, created = Niveau.objects.get_or_create(
            code='M1',
            defaults={'nom': 'Master 1', 'cycle': cycle_master, 'numero': 1}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Niveau: {niveau_m1.nom}'))

        # 9. Parcours
        parcours_info_l, created = Parcours.objects.get_or_create(
            nom='Informatique Licence',
            defaults={'filiere': filiere, 'cycle': cycle_licence}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Parcours: {parcours_info_l.nom}'))

        # 10. Semestres
        semestre_l1_s1, created = Semestre.objects.get_or_create(
            niveau=niveau_l1,
            numero=1,
            annee_academique=annee_active
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Semestre: {semestre_l1_s1}'))

        semestre_l1_s2, created = Semestre.objects.get_or_create(
            niveau=niveau_l1,
            numero=2,
            annee_academique=annee_active
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Semestre: {semestre_l1_s2}'))

        # 11. UniteEnseignementModele
        ue_modele_prog, created = UniteEnseignementModele.objects.get_or_create(
            code='UE-PROG',
            defaults={'nom': 'Programmation Avancée', 'credits': 6}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created UE Modele: {ue_modele_prog.nom}'))

        ue_modele_bdd, created = UniteEnseignementModele.objects.get_or_create(
            code='UE-BDD',
            defaults={'nom': 'Bases de Données', 'credits': 6}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created UE Modele: {ue_modele_bdd.nom}'))

        # 12. MaquettePedagogique
        maquette_l1, created = MaquettePedagogique.objects.get_or_create(
            parcours=parcours_info_l,
            niveau=niveau_l1,
            defaults={'description': 'Maquette pour Licence 1 Informatique'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Maquette Pedagogique: {maquette_l1}'))
        maquette_l1.ues_modele.add(ue_modele_prog, ue_modele_bdd)

        # 13. UniteEnseignement (concrete)
        ue_prog, created = UniteEnseignement.objects.get_or_create(
            semestre=semestre_l1_s1,
            code='PROG-S1',
            defaults={'nom': 'Programmation S1', 'credits': 6, 'modele': ue_modele_prog}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created concrete UE: {ue_prog.nom}'))

        ue_bdd, created = UniteEnseignement.objects.get_or_create(
            semestre=semestre_l1_s2,
            code='BDD-S2',
            defaults={'nom': 'Bases de Données S2', 'credits': 6, 'modele': ue_modele_bdd}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created concrete UE: {ue_bdd.nom}'))

        # 14. ElementConstitutif
        ec_python, created = ElementConstitutif.objects.get_or_create(
            ue=ue_prog,
            code='PYT',
            defaults={'nom': 'Python', 'credits': 3}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created EC: {ec_python.nom}'))

        ec_sql, created = ElementConstitutif.objects.get_or_create(
            ue=ue_bdd,
            code='SQL',
            defaults={'nom': 'SQL', 'credits': 3}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created EC: {ec_sql.nom}'))

        # 15. Classe
        classe_l1_s1_info, created = Classe.objects.get_or_create(
            nom='L1 Info Groupe A S1',
            annee_academique=annee_active,
            parcours=parcours_info_l,
            semestre=semestre_l1_s1
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Classe: {classe_l1_s1_info.nom}'))

        classe_l1_s2_info, created = Classe.objects.get_or_create(
            nom='L1 Info Groupe A S2',
            annee_academique=annee_active,
            parcours=parcours_info_l,
            semestre=semestre_l1_s2
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Classe: {classe_l1_s2_info.nom}'))

        # 16. Get Kira user
        try:
            kira_user = User.objects.get(username__iexact='Kira')
            self.stdout.write(self.style.SUCCESS(f'Found user: {kira_user.username}'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('User "Kira" not found. Please create it first.'))
            return

        # 17. Inscription
        inscription_kira_s1, created = Inscription.objects.get_or_create(
            etudiant=kira_user,
            classe=classe_l1_s1_info,
            annee_academique=annee_active
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Inscription for {kira_user.username} in {classe_l1_s1_info.nom}'))

        inscription_kira_s2, created = Inscription.objects.get_or_create(
            etudiant=kira_user,
            classe=classe_l1_s2_info,
            annee_academique=annee_active
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created Inscription for {kira_user.username} in {classe_l1_s2_info.nom}'))

        # 18. Notes
        Note.objects.get_or_create(
            inscription=inscription_kira_s1,
            element_constitutif=ec_python,
            defaults={'note_cc': 15.0, 'note_examen': 12.0}
        )
        Note.objects.get_or_create(
            inscription=inscription_kira_s2,
            element_constitutif=ec_sql,
            defaults={'note_cc': 10.0, 'note_examen': 8.0}
        )
        self.stdout.write(self.style.SUCCESS('Added sample notes for Kira.'))

        self.stdout.write(self.style.SUCCESS('Data population complete!'))
