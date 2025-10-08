import json
import logging
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from users.models import CustomUser
from roles.models import Role
from academics.models import Classe, Inscription, Filiere, Niveau, Parcours, AnneeAcademique, Note

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class UserCreateAPIView(View):
    def post(self, request, *args, **kwargs):
        logger.info("UserCreateAPIView POST request received.")
        try:
            data = json.loads(request.body)
            email = data.get('email')
            # Utiliser l'email comme username pour simplifier
            username = email

            # Champs du formulaire
            password = data.get('password', 'password123') # Mot de passe par défaut pour le test
            first_name = data.get('prenom')
            last_name = data.get('nom')
            birth_date = data.get('naissance')
            phone_number = data.get('tel')
            matricule = data.get('matricule')
            role_name = data.get('role')

            if not email:
                return JsonResponse({'error': 'Email is required.'}, status=400)

            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username (email) already exists.'}, status=400)

            # Création de l'utilisateur en 2 temps pour gérer les champs personnalisés
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            user.first_name = first_name
            user.last_name = last_name
            user.birth_date = birth_date
            user.phone_number = phone_number
            user.matricule = matricule
            user.save()

            # Assignation du rôle
            if role_name:
                try:
                    role = Role.objects.get(name=role_name)
                    user.roles.set([role])
                except Role.DoesNotExist:
                    # Ne pas bloquer la création si le rôle n'existe pas, juste logger
                    logger.warning(f"Role '{role_name}' not found for user '{username}'.")
            
            logger.info(f"User '{user.username}' created successfully.")
            return JsonResponse({'message': 'User created successfully!', 'user_id': user.id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            logger.exception("An unexpected error occurred during user creation.")
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class EnrollStudentAPIView(View):
    def post(self, request, *args, **kwargs):
        logger.info("EnrollStudentAPIView POST request received.")
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            classe_id = data.get('classe_id')

            if not all([user_id, classe_id]):
                return JsonResponse({'error': 'user_id and classe_id are required.'}, status=400)

            try:
                user = CustomUser.objects.get(id=user_id)
                classe = Classe.objects.get(id=classe_id)
            except CustomUser.DoesNotExist:
                return JsonResponse({'error': f'User with id {user_id} does not exist.'}, status=404)
            except Classe.DoesNotExist:
                return JsonResponse({'error': f'Classe with id {classe_id} does not exist.'}, status=404)

            # Assigner le rôle "Etudiant" si l'utilisateur ne l'a pas déjà
            student_role, _ = Role.objects.get_or_create(name='Etudiant')
            user.roles.add(student_role)

            # Créer l'inscription
            inscription, created = Inscription.objects.get_or_create(
                etudiant=user,
                classe=classe,
            )

            if not created:
                return JsonResponse({'message': 'Student is already enrolled in this class.'}, status=200)

            logger.info(f"User '{user.username}' successfully enrolled in class '{classe}'.")
            return JsonResponse({'message': 'Student enrolled successfully!'}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            logger.exception("An unexpected error occurred during enrollment.")
            return JsonResponse({'error': str(e)}, status=500)

class TestUserCreationView(View):
    def get(self, request, *args, **kwargs):
        from django.shortcuts import render
        return render(request, 'api_tests/create_user.html')

class TestInterfaceView(View):
    def get(self, request, *args, **kwargs):
        from django.shortcuts import render
        return render(request, 'api_tests/test.html')

@method_decorator(csrf_exempt, name='dispatch')
class UserListView(View):
    def get(self, request, *args, **kwargs):
        users = CustomUser.objects.all().values('id', 'username', 'first_name', 'last_name')
        return JsonResponse(list(users), safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class FiliereListView(View):
    def get(self, request, *args, **kwargs):
        filieres = Filiere.objects.all().values('id', 'nom', 'code')
        return JsonResponse(list(filieres), safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class NiveauListView(View):
    def get(self, request, *args, **kwargs):
        niveaux = Niveau.objects.all().values('id', 'nom_complet', 'numero')
        return JsonResponse(list(niveaux), safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class AssignAcademicInfoAPIView(View):
    def post(self, request, *args, **kwargs):
        logger.info("AssignAcademicInfoAPIView POST request received.")
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            filiere_id = data.get('filiere_id')
            niveau_id = data.get('niveau_id')

            if not all([user_id, filiere_id, niveau_id]):
                return JsonResponse({'error': 'user_id, filiere_id, and niveau_id are required.'}, status=400)

            try:
                user = CustomUser.objects.get(id=user_id)
                filiere = Filiere.objects.get(id=filiere_id)
                niveau = Niveau.objects.get(id=niveau_id)
            except CustomUser.DoesNotExist:
                return JsonResponse({'error': f'User with id {user_id} does not exist.'}, status=404)
            except Filiere.DoesNotExist:
                return JsonResponse({'error': f'Filiere with id {filiere_id} does not exist.'}, status=404)
            except Niveau.DoesNotExist:
                return JsonResponse({'error': f'Niveau with id {niveau_id} does not exist.'}, status=404)

            # Trouver l'année académique active
            active_annee = AnneeAcademique.objects.filter(est_active=True).first()
            if not active_annee:
                return JsonResponse({'error': 'No active academic year found. Please create one.'}, status=400)

            # Trouver ou créer un parcours par défaut pour la filière
            # Pour l'instant, on prend le premier parcours de la filière, ou on en crée un simple
            parcours = filiere.parcours.first()
            if not parcours:
                # Créer un parcours par défaut si aucun n'existe
                parcours, _ = Parcours.objects.get_or_create(
                    filiere=filiere,
                    nom=f'{filiere.nom} - Parcours Général',
                    code=f'{filiere.code}-PG'
                )

            # Trouver ou créer la classe (groupe par défaut 'Groupe A')
            classe, created_classe = Classe.objects.get_or_create(
                annee_academique=active_annee,
                parcours=parcours,
                niveau=niveau,
                nom='Groupe A' # Assumer un groupe par défaut pour l'instant
            )

            # Assigner le rôle "Etudiant" si l'utilisateur ne l'a pas déjà
            student_role, _ = Role.objects.get_or_create(name='Etudiant')
            user.roles.add(student_role)

            # Créer l'inscription
            inscription, created_inscription = Inscription.objects.get_or_create(
                etudiant=user,
                classe=classe,
            )

            if not created_inscription:
                return JsonResponse({'message': 'Student is already enrolled in this class.'}, status=200)

            logger.info(f"User '{user.username}' successfully enrolled in class '{classe}'.")
            return JsonResponse({'message': 'Student enrolled successfully!', 'classe_id': classe.id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            logger.exception("An unexpected error occurred during academic info assignment.")
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class StudentGradesAPIView(View):
    def get(self, request, *args, **kwargs):
        logger.info("StudentGradesAPIView GET request received.")
        user_id = request.GET.get('user_id')

        if not user_id:
            return JsonResponse({'error': 'user_id is required.'}, status=400)

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': f'User with id {user_id} does not exist.'}, status=404)

        grades_data = []
        try:
            inscriptions = Inscription.objects.filter(etudiant=user).select_related('classe')

            for inscription in inscriptions:
                classe_info = {
                    'id': inscription.classe.id,
                    'nom': str(inscription.classe),
                    'filiere': inscription.classe.parcours.filiere.nom if inscription.classe.parcours and inscription.classe.parcours.filiere else None,
                    'niveau': inscription.classe.niveau.nom_complet if inscription.classe.niveau else None,
                    'annee_academique': inscription.classe.annee_academique.nom if inscription.classe.annee_academique else None,
                }
                
                notes_for_inscription = []
                # Récupérer les notes pour cette inscription
                notes = Note.objects.filter(inscription=inscription).select_related('element_constitutif__ue')

                for note in notes:
                    notes_for_inscription.append({
                        'ue': note.element_constitutif.ue.nom if note.element_constitutif and note.element_constitutif.ue else None,
                        'matiere': note.element_constitutif.nom if note.element_constitutif else None,
                        'code_matiere': note.element_constitutif.code if note.element_constitutif else None,
                        'note_cc': note.note_cc,
                        'note_examen': note.note_examen,
                        'note_finale': note.note_finale,
                        'credits': note.element_constitutif.credits if note.element_constitutif else None,
                    })
                grades_data.append({
                    'inscription_id': inscription.id,
                    'classe_info': classe_info,
                    'notes': notes_for_inscription,
                })

            return JsonResponse({'user_id': user.id, 'grades': grades_data}, safe=False)
        except Exception as e:
            logger.exception("Error fetching student grades for user %s", user_id)
            return JsonResponse({'error': str(e)}, status=500)
