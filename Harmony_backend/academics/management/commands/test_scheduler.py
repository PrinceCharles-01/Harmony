import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model

from academics.models.common import AnneeAcademique, Inscription
from academics.models.lmd import Cycle, Niveau, Parcours, Semestre, UniteEnseignementModele, UniteEnseignement, ElementConstitutif, Classe, Filiere
from academics.models.scheduling import Salle, Cours, SessionCours
from academics.services.scheduling_service import SchedulingService
from users.models import Enseignant # Assuming Enseignant is in users.models

User = get_user_model()

class Command(BaseCommand):
    help = 'Tests the basic scheduling service by creating dummy data and running the scheduler.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("--- Starting Scheduler Test ---"))

        with transaction.atomic():
            # 1. Clean up previous test data (optional, but good for repeatable tests)
            SessionCours.objects.all().delete()
            Cours.objects.all().delete()
            # Delete Inscription objects first, as they protect Classe and AnneeAcademique
            Inscription.objects.all().delete() # ADD THIS LINE
            ElementConstitutif.objects.all().delete()
            UniteEnseignement.objects.all().delete()
            UniteEnseignementModele.objects.all().delete()
            Classe.objects.all().delete()
            Parcours.objects.all().delete()
            Niveau.objects.all().delete()
            Cycle.objects.all().delete()
            Salle.objects.all().delete()
            Enseignant.objects.all().delete()
            User.objects.filter(email__startswith='test_').delete()
            AnneeAcademique.objects.filter(nom='2025-2026').delete()


            # 2. Create an AnneeAcademique
            annee_academique, created = AnneeAcademique.objects.get_or_create(
                nom='2025-2026',
                defaults={'date_debut': datetime.date(2025, 9, 1), 'date_fin': datetime.date(2026, 6, 30), 'est_active': True}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created AnneeAcademique: {annee_academique}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Using existing AnneeAcademique: {annee_academique}"))
                annee_academique.est_active = True
                annee_academique.save()


            # 3. Create a CustomUser and Enseignant
            user, created = User.objects.get_or_create(
                email='test_enseignant@example.com',
                defaults={'username': 'test_enseignant', 'first_name': 'Jean', 'last_name': 'Dupont'}
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created User: {user.email}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Using existing User: {user.email}"))

            enseignant, created = Enseignant.objects.get_or_create(
                user=user,
                defaults={'grade': 'Professeur Associé'}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Enseignant: {enseignant}"))
            else:
                self.stdout.write(self.style.SUCCESS(f"Using existing Enseignant: {enseignant}"))
            
            # Add some tags and cycles to the teacher
            cycle_licence, _ = Cycle.objects.get_or_create(nom='Licence', code='L', defaults={'duree_annees': 3})
            cycle_master, _ = Cycle.objects.get_or_create(nom='Master', code='M', defaults={'duree_annees': 2})
            enseignant.tags = ['Mathématiques', 'Algorithmes']
            enseignant.cycles.add(cycle_licence, cycle_master)
            enseignant.save()
            self.stdout.write(self.style.SUCCESS(f"Enseignant tags: {enseignant.tags}, cycles: {[c.nom for c in enseignant.cycles.all()]}"))


            # 4. Create Cycle, Niveau, Parcours, Semestre
            # Cycle 'Licence' created above
            niveau_l1, _ = Niveau.objects.get_or_create(cycle=cycle_licence, numero=1, defaults={'code': 'L1', 'nom': 'Licence 1'})

            # Create Filiere first
            filiere_info, _ = Filiere.objects.get_or_create(
                nom='Informatique',
                defaults={'code': 'INFO', 'departement': None} # Departement can be null
            )

            parcours_info, _ = Parcours.objects.get_or_create(
                filiere=filiere_info, # Link to Filiere object
                cycle=cycle_licence,
                nom='Informatique L1'
            )
            semestre_s1, _ = Semestre.objects.get_or_create(niveau=niveau_l1, numero=1, annee_academique=annee_academique)


            # 5. Create UniteEnseignementModele, UniteEnseignement, ElementConstitutif
            ue_modele, _ = UniteEnseignementModele.objects.get_or_create(code='UE101', nom='Introduction à la Programmation', credits=6)
            ue, _ = UniteEnseignement.objects.get_or_create(semestre=semestre_s1, modele=ue_modele, code='UE101', nom='Introduction à la Programmation', credits=6)
            
            element_constitutif, _ = ElementConstitutif.objects.get_or_create(
                ue=ue,
                code='EC101',
                nom='Algorithmique et Structures de Données',
                defaults={'credits': 3, 'volume_horaire_forfaitaire': 30}
            )
            # Add some tags and cycles to the ElementConstitutif
            element_constitutif.tags = ['Algorithmique', 'Programmation']
            element_constitutif.cycles.add(cycle_licence)
            element_constitutif.save()
            self.stdout.write(self.style.SUCCESS(f"ElementConstitutif tags: {element_constitutif.tags}, cycles: {[c.nom for c in element_constitutif.cycles.all()]}"))


            # 6. Create a Classe
            classe, _ = Classe.objects.get_or_create(
                nom='L1 Groupe A',
                annee_academique=annee_academique,
                parcours=parcours_info,
                semestre=semestre_s1
            )

            # 7. Create a Salle
            salle, _ = Salle.objects.get_or_create(nom='Amphi B', defaults={'capacite': 100})
            salle2, _ = Salle.objects.get_or_create(nom='Salle TD1', defaults={'capacite': 30})


            # 8. Create a Cours instance
            cours, _ = Cours.objects.get_or_create(
                element_constitutif=element_constitutif,
                enseignant=enseignant,
                classe=classe,
                annee_academique=annee_academique,
                defaults={'volume_horaire_total': 30} # 30 hours total
            )
            self.stdout.write(self.style.SUCCESS(f"Created Cours: {cours}"))


            # 9. Run the Scheduling Service
            self.stdout.write(self.style.SUCCESS("\n--- Running Scheduling Service ---"))
            scheduler = SchedulingService(annee_academique=annee_academique)

            scheduled_sessions, unscheduled_courses = scheduler.generate_schedule(
                classes_to_schedule=[classe],
                available_salles=[salle, salle2],
                working_days=[0, 1, 2, 3, 4], # Monday to Friday
                daily_start_time=datetime.time(9, 0),
                daily_end_time=datetime.time(17, 0),
                session_duration=datetime.timedelta(hours=1, minutes=30),
                break_duration=datetime.timedelta(minutes=15)
            )

            self.stdout.write(self.style.SUCCESS("\n--- Scheduling Results ---"))
            if scheduled_sessions:
                self.stdout.write(self.style.SUCCESS(f"Successfully scheduled {len(scheduled_sessions)} sessions:"))
                for session in scheduled_sessions:
                    self.stdout.write(f"- {session.cours.element_constitutif.nom} ({session.cours.classe.nom}) with {session.cours.enseignant.user.get_full_name()} in {session.salle.nom} from {session.date_debut} to {session.date_fin}")
            else:
                self.stdout.write(self.style.WARNING("No sessions were scheduled."))

            if unscheduled_courses:
                self.stdout.write(self.style.ERROR(f"Failed to schedule {len(unscheduled_courses)} courses:"))
                for course in unscheduled_courses:
                    self.stdout.write(f"- {course.element_constitutif.nom} ({course.classe.nom})")
            else:
                self.stdout.write(self.style.SUCCESS("All courses were successfully scheduled."))

        self.stdout.write(self.style.SUCCESS("\n--- Scheduler Test Finished ---"))
