import json
import logging
from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from academics.models.lmd import CalculLMD, Classe, Inscription, Filiere, Niveau, Parcours, AnneeAcademique, Note, Cycle, Semestre, ElementConstitutif, Universite, Faculte, Departement, UniteEnseignement, ValidationUE
from users.models import CustomUser, Enseignant

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class FiliereListView(View):
    def get(self, request, *args, **kwargs):
        filieres = Filiere.objects.all().values('id', 'nom', 'code')
        return JsonResponse(list(filieres), safe=False)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

@method_decorator(csrf_exempt, name='dispatch')
class UserCreateAPIView(APIView):
    def post(self, request, *args, **kwargs):
        logger.info("UserCreateAPIView POST request received.")
        try:
            data = request.data
            
            # Get data from the form
            matricule = data.get('matricule')
            email = data.get('email')
            password = data.get('password', 'password123') # Default password for testing
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            date_de_naissance = data.get('date_de_naissance')
            if date_de_naissance:
                date_de_naissance = date_de_naissance.strip()
            lieu_de_naissance = data.get('lieu_de_naissance')
            nationalite = data.get('nationalite')
            phone_number = data.get('phone_number')
            role_name = data.get('role')

            # Use matricule as username, as decided
            username = matricule

            if not username:
                return Response({'error': 'Matricule is required.'}, status=status.HTTP_400_BAD_REQUEST)

            if CustomUser.objects.filter(username=username).exists():
                return Response({'error': f'User with username (matricule) "{username}" already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if CustomUser.objects.filter(matricule=matricule).exists():
                return Response({'error': f'User with matricule "{matricule}" already exists.'}, status=status.HTTP_400_BAD_REQUEST)

            # Create user
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            
            # Set other fields
            user.first_name = first_name
            user.last_name = last_name
            user.date_de_naissance = date_de_naissance
            user.lieu_de_naissance = lieu_de_naissance
            user.nationalite = nationalite
            user.phone_number = phone_number
            user.matricule = matricule
            user.save()

            # Assign role
            if role_name:
                try:
                    role = Role.objects.get(name=role_name)
                    user.roles.set([role])
                except Role.DoesNotExist:
                    logger.warning(f"Role '{role_name}' not found for user '{username}'.")
            
            logger.info(f"User '{user.username}' created successfully.")
            return Response({'message': 'User created successfully!', 'user_id': user.id}, status=status.HTTP_201_CREATED)

        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("An unexpected error occurred during user creation.")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
class FiliereCreateView(View):
    def post(self, request, *args, **kwargs):
        logger.info("FiliereCreateView POST request received.")
        try:
            data = json.loads(request.body)
            nom = data.get('nom')
            code = data.get('code')

            if not all([nom, code]):
                return JsonResponse({'error': 'nom and code are required.'}, status=400)

            if Filiere.objects.filter(code=code).exists():
                return JsonResponse({'error': f'Filiere with code {code} already exists.'}, status=400)

            filiere = Filiere.objects.create(nom=nom, code=code)

            logger.info(f"Filiere '{filiere.nom}' created successfully.")
            return JsonResponse({'message': 'Filiere created successfully!', 'filiere_id': filiere.id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)
        except Exception as e:
            logger.exception("An unexpected error occurred during filiere creation.")
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class NiveauListView(View):
    def get(self, request, *args, **kwargs):
        niveaux = Niveau.objects.all().values('id', 'nom', 'code', 'numero', 'cycle_id')
        return JsonResponse(list(niveaux), safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class AnneeAcademiqueListView(View):
    def get(self, request, *args, **kwargs):
        annees = AnneeAcademique.objects.all().values('id', 'nom')
        return JsonResponse(list(annees), safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class CycleListView(View):
    def get(self, request, *args, **kwargs):
        cycles = Cycle.objects.all().values('id', 'nom')
        return JsonResponse(list(cycles), safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class ParcoursListView(View):
    def get(self, request, *args, **kwargs):
        parcours = Parcours.objects.select_related('filiere', 'cycle').all()
        data = [{
            'id': p.id,
            'nom': p.nom,
            'code': p.code,
            'filiere_id': p.filiere.id,
            'filiere_nom': p.filiere.nom,
            'cycle_id': p.cycle.id if p.cycle else None,
            'cycle_nom': p.cycle.nom if p.cycle else None
        } for p in parcours]
        return JsonResponse(data, safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class ParcoursCreateView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            filiere_id = data.get('filiere_id')
            cycle_id = data.get('cycle_id')
            nom = data.get('nom')
            code = data.get('code')

            if not all([filiere_id, cycle_id, nom, code]):
                return JsonResponse({'error': 'filiere_id, cycle_id, nom, and code are required.'}, status=400)

            filiere = Filiere.objects.get(id=filiere_id)
            cycle = Cycle.objects.get(id=cycle_id)
            parcours = Parcours.objects.create(filiere=filiere, cycle=cycle, nom=nom, code=code)
            
            return JsonResponse({'message': 'Parcours created successfully!', 'parcours_id': parcours.id}, status=201)
        except (Filiere.DoesNotExist, Cycle.DoesNotExist):
            return JsonResponse({'error': 'Invalid filiere_id or cycle_id.'}, status=404)
        except Exception as e:
            logger.exception("Error creating parcours")
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ClasseListView(View):
    def get(self, request, *args, **kwargs):
        classes = Classe.objects.select_related('annee_academique', 'parcours__filiere', 'semestre__niveau').all()
        data = [{
            'id': c.id,
            'nom': str(c), # Utilise la méthode __str__ du modèle
        } for c in classes]
        return JsonResponse(data, safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class ClasseCreateView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            annee_id = data.get('annee_academique_id')
            parcours_id = data.get('parcours_id')
            semestre_id = data.get('semestre_id') # Changed from niveau_id
            nom = data.get('nom')

            if not all([annee_id, parcours_id, semestre_id, nom]):
                # Updated error message
                return JsonResponse({'error': 'annee_academique_id, parcours_id, semestre_id, and nom are required.'}, status=400)

            annee = AnneeAcademique.objects.get(id=annee_id)
            parcours = Parcours.objects.get(id=parcours_id)
            semestre = Semestre.objects.get(id=semestre_id) # Changed from Niveau
            
            classe = Classe.objects.create(
                annee_academique=annee,
                parcours=parcours,
                semestre=semestre, # Changed from niveau
                nom=nom
            )
            
            return JsonResponse({'message': 'Classe created successfully!', 'classe_id': classe.id}, status=201)
        # Updated exception handling
        except (AnneeAcademique.DoesNotExist, Parcours.DoesNotExist, Semestre.DoesNotExist) as e:
            return JsonResponse({'error': f'Invalid ID provided: {e}'}, status=404)
        except Exception as e:
            logger.exception("Error creating classe")
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

        response_data = {'user_id': user.id, 'grades_by_year': []}

        try:
            logger.info(f"Fetching grades for user_id: {user_id}")
            # 1. Get all inscriptions for the user
            inscriptions = Inscription.objects.filter(etudiant=user).select_related(
                'classe__annee_academique', 
                'classe__parcours__filiere',
                'classe__semestre__niveau'
            ).order_by('classe__annee_academique__nom')
            logger.info(f"Found {inscriptions.count()} inscriptions.")

            # Group inscriptions by academic year
            from itertools import groupby
            
            inscriptions_by_year = {k: list(v) for k, v in groupby(inscriptions, key=lambda i: i.classe.annee_academique)}

            for annee, inscriptions_in_year in inscriptions_by_year.items():
                logger.info(f"Processing year: {annee.nom}")
                year_data = {
                    'annee_academique_id': annee.id,
                    'annee_academique_nom': annee.nom,
                    'semestres': [],
                    'moyenne_annee': None
                }

                # Get all unique semestres for this year's inscriptions
                semestre_ids = {i.classe.semestre.id for i in inscriptions_in_year if i.classe.semestre}
                logger.info(f"Found semester IDs for this year: {semestre_ids}")
                semestres = Semestre.objects.filter(id__in=semestre_ids).select_related('niveau').order_by('numero')

                semestre_moyennes = []

                for semestre in semestres:
                    logger.info(f"-- Processing semester: {semestre}")
                    semestre_data = {
                        'semestre_id': semestre.id,
                        'semestre_nom': str(semestre),
                        'ues': []
                    }
                    
                    # Find the relevant inscription for this semester
                    # This assumes one inscription per student per semester, which is a simplification
                    inscription = next((i for i in inscriptions_in_year if i.classe.semestre == semestre), None)
                    if not inscription:
                        logger.warning(f"-- No inscription found for semester {semestre.id} in this year group. Skipping.")
                        continue

                    ues = UniteEnseignement.objects.filter(semestre=semestre).prefetch_related('ecs')
                    logger.info(f"---- Found {ues.count()} UEs for this semester.")
                    
                    for ue in ues:
                        # Use ValidationUE to calculate and get UE average
                        validation_ue, _ = ValidationUE.objects.get_or_create(inscription=inscription, ue=ue)
                        validation_ue.calculer() # Recalculate to be sure

                        matieres_data = []
                        notes_for_ue = Note.objects.filter(inscription=inscription, element_constitutif__ue=ue)
                        
                        for note in notes_for_ue:
                            matieres_data.append({
                                'matiere': note.element_constitutif.nom,
                                'code_matiere': note.element_constitutif.code,
                                'note_cc': note.note_cc,
                                'note_examen': note.note_examen,
                                'note_finale': note.note_finale,
                                'credits': note.element_constitutif.credits,
                            })

                        semestre_data['ues'].append({
                            'ue_id': ue.id,
                            'ue_nom': ue.nom,
                            'moyenne_ue': validation_ue.moyenne,
                            'credits_obtenus': validation_ue.credits_obtenus,
                            'validee': validation_ue.validee,
                            'matieres': matieres_data
                        })

                    # Calculate semester average using CalculLMD
                    moyenne_sem = CalculLMD.moyenne_semestre(inscription, semestre)
                    semestre_data['moyenne_semestre'] = moyenne_sem
                    if moyenne_sem is not None:
                        semestre_moyennes.append(moyenne_sem)

                    year_data['semestres'].append(semestre_data)

                # Calculate annual average
                if semestre_moyennes:
                    year_data['moyenne_annee'] = sum(semestre_moyennes) / len(semestre_moyennes)

                response_data['grades_by_year'].append(year_data)
            
            logger.info(f"Final data to be sent: {json.dumps(response_data, indent=2, default=str)}")
            return JsonResponse(response_data, safe=False)
        except Exception as e:
            logger.exception("Error fetching student grades for user %s", user_id)
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class SemestreListView(View):
    def get(self, request, *args, **kwargs):
        semestres = Semestre.objects.select_related('niveau__cycle').all()
        data = [{
            'id': s.id,
            'nom': str(s),
            'niveau_id': s.niveau.id,
            'cycle_id': s.niveau.cycle.id
        } for s in semestres]
        return JsonResponse(data, safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class ElementConstitutifListView(View):
    def get(self, request, *args, **kwargs):
        subjects = ElementConstitutif.objects.all().values('id', 'nom', 'code', 'credits', 'coeff_cc', 'coeff_examen', 'ue_id')
        return JsonResponse(list(subjects), safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class UniteEnseignementListView(View):
    def get(self, request, *args, **kwargs):
        ues = UniteEnseignement.objects.all().values('id', 'nom', 'semestre_id')
        return JsonResponse(list(ues), safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class StudentListView(View):
    def get(self, request, *args, **kwargs):
        class_id = request.GET.get('class_id')
        if not class_id:
            return JsonResponse({'error': 'class_id is required.'}, status=400)

        try:
            classe = Classe.objects.get(id=class_id)
        except Classe.DoesNotExist:
            return JsonResponse({'error': f'Classe with id {class_id} does not exist.'}, status=404)

        inscriptions = Inscription.objects.filter(classe=classe).select_related('etudiant')
        students = [{
            'id': inscription.etudiant.id,
            'username': inscription.etudiant.username,
            'first_name': inscription.etudiant.first_name,
            'last_name': inscription.etudiant.last_name,
            'studentNumber': inscription.etudiant.matricule, # Assuming matricule is the student number
        } for inscription in inscriptions]

        return JsonResponse(students, safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class EnseignantListView(View):
    def get(self, request, *args, **kwargs):
        teachers = Enseignant.objects.select_related('user').all()
        data = [{
            'id': teacher.id,
            'first_name': teacher.user.first_name,
            'last_name': teacher.user.last_name,
            'grade': teacher.grade,
            'email': teacher.user.email,
        } for teacher in teachers]
        return JsonResponse(data, safe=False)

@method_decorator(csrf_exempt, name='dispatch')
class ElementConstitutifCreateView(View):
    def post(self, request, *args, **kwargs):
        logger.info("ElementConstitutifCreateView POST request received.")
        try:
            data = json.loads(request.body)
            nom = data.get('nom')
            code = data.get('code')
            credits = data.get('credits')
            coeff_cc = data.get('coeff_cc')
            coeff_examen = data.get('coeff_examen')
            ue_id = data.get('ue_id')

            if not all([nom, code, credits, coeff_cc, coeff_examen, ue_id]):
                return JsonResponse({'error': 'nom, code, credits, coeff_cc, coeff_examen, and ue_id are required.'}, status=400)

            try:
                ue = UniteEnseignement.objects.get(id=ue_id)
            except UniteEnseignement.DoesNotExist:
                return JsonResponse({'error': f'UniteEnseignement with id {ue_id} does not exist.'}, status=404)

            subject = ElementConstitutif.objects.create(
                nom=nom,
                code=code,
                credits=credits,
                coeff_cc=coeff_cc,
                coeff_examen=coeff_examen,
                ue=ue,
            )

            return JsonResponse({'message': 'Subject created successfully!', 'id': subject.id}, status=201)

        except Exception as e:
            logger.exception("An unexpected error occurred during subject creation.")
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ElementConstitutifUpdateView(View):
    def put(self, request, pk, *args, **kwargs):
        logger.info(f"ElementConstitutifUpdateView PUT request received for ID: {pk}")
        try:
            data = json.loads(request.body)
            subject = ElementConstitutif.objects.get(pk=pk)

            subject.nom = data.get('nom', subject.nom)
            subject.code = data.get('code', subject.code)
            subject.credits = data.get('credits', subject.credits)
            subject.coeff_cc = data.get('coeff_cc', subject.coeff_cc)
            subject.coeff_examen = data.get('coeff_examen', subject.coeff_examen)
            ue_id = data.get('ue_id')
            if ue_id:
                try:
                    ue = UniteEnseignement.objects.get(id=ue_id)
                    subject.ue = ue
                except UniteEnseignement.DoesNotExist:
                    return JsonResponse({'error': f'UniteEnseignement with id {ue_id} does not exist.'}, status=404)
            subject.save()

            return JsonResponse({'message': 'Subject updated successfully!'}, status=200)

        except ElementConstitutif.DoesNotExist:
            return JsonResponse({'error': 'Subject not found.'}, status=404)
        except Exception as e:
            logger.exception("An unexpected error occurred during subject update.")
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class ElementConstitutifDeleteView(View):
    def delete(self, request, pk, *args, **kwargs):
        logger.info(f"ElementConstitutifDeleteView DELETE request received for ID: {pk}")
        try:
            subject = ElementConstitutif.objects.get(pk=pk)
            subject.delete()
            return JsonResponse({'message': 'Subject deleted successfully!'}, status=204)
        except ElementConstitutif.DoesNotExist:
            return JsonResponse({'error': 'Subject not found.'}, status=404)
        except Exception as e:
            logger.exception("An unexpected error occurred during subject deletion.")
            return JsonResponse({'error': str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class SaveGradesAPIView(View):
    def post(self, request, *args, **kwargs):
        logger.info("SaveGradesAPIView POST request received.")
        try:
            data = json.loads(request.body)
            class_id = data.get('class')
            subject_id = data.get('subject')
            evaluation_type = data.get('evaluation')
            grades = data.get('grades')

            if not all([class_id, subject_id, grades, evaluation_type]):
                return JsonResponse({'error': 'class_id, subject_id, grades, and evaluation_type are required.'}, status=400)

            try:
                classe = Classe.objects.get(id=class_id)
                subject = ElementConstitutif.objects.get(id=subject_id)
            except Classe.DoesNotExist:
                return JsonResponse({'error': f'Classe with id {class_id} does not exist.'}, status=404)
            except ElementConstitutif.DoesNotExist:
                return JsonResponse({'error': f'ElementConstitutif with id {subject_id} does not exist.'}, status=404)

            for student_id, grade_value in grades.items():
                if grade_value:
                    try:
                        student = CustomUser.objects.get(id=student_id)
                        inscription = Inscription.objects.get(etudiant=student, classe=classe)
                        
                        update_field = {}
                        if evaluation_type == 'cc':
                            update_field['note_cc'] = grade_value
                        elif evaluation_type == 'examen':
                            update_field['note_examen'] = grade_value
                        else:
                            logger.warning(f"Invalid evaluation type: {evaluation_type}")
                            continue

                        Note.objects.update_or_create(
                            inscription=inscription,
                            element_constitutif=subject,
                            defaults=update_field
                        )
                    except CustomUser.DoesNotExist:
                        logger.warning(f"User with id {student_id} not found, skipping grade entry.")
                    except Inscription.DoesNotExist:
                        logger.warning(f"Inscription for user {student_id} in class {class_id} not found, skipping grade entry.")

            return JsonResponse({'message': 'Grades saved successfully!'}, status=200)

        except Exception as e:
            logger.exception("An unexpected error occurred during grade saving.")
            return JsonResponse({'error': str(e)}, status=500)
