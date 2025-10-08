from django.test import TestCase
from django.core.exceptions import ValidationError
from decimal import Decimal
from .models import (
    Filiere, Parcours, Cycle, Niveau, Semestre, UniteEnseignement,
    ElementConstitutif, Classe, Note, Inscription, AnneeAcademique, MaquettePedagogique
)
from users.models import CustomUser

class AcademicsModelsTestCase(TestCase):
    def setUp(self):
        # Création des instances nécessaires pour les tests
        self.annee_acad = AnneeAcademique.objects.create(nom="2024-2025", date_debut="2024-09-01", date_fin="2025-07-31")
        self.filiere = Filiere.objects.create(nom="Informatique", code="INFO")
        self.parcours = Parcours.objects.create(filiere=self.filiere, nom="Génie Logiciel", code="GL")
        self.cycle = Cycle.objects.create(nom="Licence", code="L")
        self.niveau = Niveau.objects.create(cycle=self.cycle, numero=1, nom_complet="Licence 1")
        self.semestre = Semestre.objects.create(niveau=self.niveau, numero=1)
        self.ue = UniteEnseignement.objects.create(nom="UE Fondamentale", code="UEF1")
        self.maquette = MaquettePedagogique.objects.create(semestre=self.semestre, ue=self.ue, coefficient=2)
        self.ec = ElementConstitutif.objects.create(
            ue=self.ue, nom="Algorithmique", code="ALGO1",
            coeff_cc=Decimal('0.4'), coeff_examen=Decimal('0.6')
        )
        self.etudiant = CustomUser.objects.create_user(username="etudiant1", password="password123")
        self.classe = Classe.objects.create(
            nom="L1 GL", annee_academique=self.annee_acad, parcours=self.parcours, niveau=self.niveau
        )
        self.inscription = Inscription.objects.create(etudiant=self.etudiant, classe=self.classe)

    def test_element_constitutif_coeff_validation(self):
        """ Teste que la somme des coefficients de l'EC doit être égale à 1. """
        with self.assertRaises(ValidationError):
            ec_invalid = ElementConstitutif(
                ue=self.ue, nom="Test", code="TEST",
                coeff_cc=Decimal('0.5'), coeff_examen=Decimal('0.6')
            )
            ec_invalid.clean()

        # Test valid case
        ec_valid = ElementConstitutif(
            ue=self.ue, nom="Test Valid", code="TESTV",
            coeff_cc=Decimal('0.5'), coeff_examen=Decimal('0.5')
        )
        ec_valid.clean() # Should not raise ValidationError

    def test_calculate_final_note(self):
        """ Teste le calcul de la note finale dans différents scénarios. """
        # Scénario 1: note_cc et note_examen sont présentes
        ec1 = ElementConstitutif.objects.create(
            ue=self.ue, nom="Algo S1", code="ALGO_S1",
            coeff_cc=Decimal('0.4'), coeff_examen=Decimal('0.6')
        )
        note1 = Note.objects.create(
            inscription=self.inscription, element_constitutif=ec1,
            note_cc=Decimal('12.5'), note_examen=Decimal('15.0')
        )
        self.assertEqual(note1.note_finale, (Decimal('12.5') * Decimal('0.4')) + (Decimal('15.0') * Decimal('0.6')))

        # Scénario 2: Seule la note_cc est présente
        ec2 = ElementConstitutif.objects.create(
            ue=self.ue, nom="Algo S2", code="ALGO_S2",
            coeff_cc=Decimal('1.0'), coeff_examen=Decimal('0.0')
        )
        note2 = Note.objects.create(
            inscription=self.inscription, element_constitutif=ec2,
            note_cc=Decimal('14.0')
        )
        self.assertEqual(note2.note_finale, Decimal('14.0'))

        # Scénario 3: Seule la note d'examen est présente
        ec3 = ElementConstitutif.objects.create(
            ue=self.ue, nom="Algo S3", code="ALGO_S3",
            coeff_cc=Decimal('0.0'), coeff_examen=Decimal('1.0')
        )
        note3 = Note.objects.create(
            inscription=self.inscription, element_constitutif=ec3,
            note_examen=Decimal('16.0')
        )
        self.assertEqual(note3.note_finale, Decimal('16.0'))

        # Scénario 4: Aucune note
        ec4 = ElementConstitutif.objects.create(
            ue=self.ue, nom="Algo S4", code="ALGO_S4",
            coeff_cc=Decimal('0.5'), coeff_examen=Decimal('0.5')
        )
        note4 = Note.objects.create(inscription=self.inscription, element_constitutif=ec4)
        self.assertIsNone(note4.note_finale)
        
        # Scénario 5: Calcul impossible
        ec5 = ElementConstitutif.objects.create(
            ue=self.ue, nom="Algo S5", code="ALGO_S5",
            coeff_cc=Decimal('0.5'), coeff_examen=Decimal('0.5')
        )
        note5 = Note.objects.create(
            inscription=self.inscription, element_constitutif=ec5,
            note_cc=Decimal('10.0')
        )
        self.assertIsNone(note5.note_finale)


    def test_maquette_pedagogique_creation(self):
        """ Teste la création et la liaison via MaquettePedagogique. """
        self.assertEqual(self.semestre.ues.count(), 1)
        self.assertEqual(self.ue.semestres.count(), 1)
        self.assertEqual(self.semestre.ues.first(), self.ue)
        
        maquette = MaquettePedagogique.objects.get(semestre=self.semestre, ue=self.ue)
        self.assertEqual(maquette.coefficient, 2)