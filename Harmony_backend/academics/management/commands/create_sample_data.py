from django.core.management.base import BaseCommand
from users.models import CustomUser
from academics.models import Classe, Inscription, Note, ElementConstitutif

class Command(BaseCommand):
    help = 'Creates sample data for the application'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Get user with id=1
        try:
            user = CustomUser.objects.get(id=1)
        except CustomUser.DoesNotExist:
            self.stdout.write(self.style.ERROR('User with id=1 not found.'))
            return

        # Get a classe
        classe = Classe.objects.first()
        if not classe:
            self.stdout.write(self.style.ERROR('No Classe found.'))
            return

        # Create an inscription
        inscription, created = Inscription.objects.get_or_create(etudiant=user, classe=classe)
        if created:
            self.stdout.write(self.style.SUCCESS(f'Inscription created for user {user.username} in classe {classe.nom}'))
        else:
            self.stdout.write(self.style.WARNING(f'Inscription already exists for user {user.username} in classe {classe.nom}'))

        # Get some elements constitutifs
        elements = ElementConstitutif.objects.all()[:2]
        if not elements:
            self.stdout.write(self.style.ERROR('No ElementConstitutif found.'))
            return

        # Create some notes
        Note.objects.get_or_create(
            inscription=inscription, 
            element_constitutif=elements[0],
            defaults={'note_cc': 15, 'note_examen': 16, 'note_finale': 15.5}
        )
        Note.objects.get_or_create(
            inscription=inscription, 
            element_constitutif=elements[1],
            defaults={'note_cc': 14, 'note_examen': 17, 'note_finale': 15.5}
        )

        self.stdout.write(self.style.SUCCESS('Sample data created successfully.'))
