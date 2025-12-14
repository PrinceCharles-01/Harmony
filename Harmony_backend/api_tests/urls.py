from django.urls import path
from .views import (
    UserCreateAPIView, TestUserCreationView, EnrollStudentAPIView, TestInterfaceView, 
    UserListView, FiliereListView, NiveauListView, StudentGradesAPIView, 
    FiliereCreateView, AnneeAcademiqueListView, ParcoursListView, ParcoursCreateView,
    ClasseListView, ClasseCreateView, CycleListView, SemestreListView,
    ElementConstitutifListView, StudentListView, SaveGradesAPIView, EnseignantListView, ElementConstitutifCreateView, ElementConstitutifUpdateView, ElementConstitutifDeleteView, UniteEnseignementListView
)

urlpatterns = [
    path('create-user/', UserCreateAPIView.as_view(), name='create_user_api'),
    path('enroll-student/', EnrollStudentAPIView.as_view(), name='enroll_student_api'),
    path('test-user-creation/', TestUserCreationView.as_view(), name='test_user_creation'),
    path('test-interface/', TestInterfaceView.as_view(), name='test_interface'),
    path('users/', UserListView.as_view(), name='user_list_api'),
    path('filieres/', FiliereListView.as_view(), name='filiere_list_api'),
    path('filieres/create/', FiliereCreateView.as_view(), name='filiere_create_api'),
    path('niveaux/', NiveauListView.as_view(), name='niveau_list_api'),
    path('semestres/', SemestreListView.as_view(), name='semestre_list_api'),
    path('student-grades/', StudentGradesAPIView.as_view(), name='student_grades_api'),

    # New URLs for academic structure management
    path('cycles/', CycleListView.as_view(), name='cycle_list_api'),
    path('annees-academiques/', AnneeAcademiqueListView.as_view(), name='annee_academique_list_api'),
    path('parcours/', ParcoursListView.as_view(), name='parcours_list_api'),
    path('parcours/create/', ParcoursCreateView.as_view(), name='parcours_create_api'),
    path('classes/', ClasseListView.as_view(), name='classe_list_api'),
    path('classes/create/', ClasseCreateView.as_view(), name='classe_create_api'),
    path('subjects/', ElementConstitutifListView.as_view(), name='subject_list_api'),
    path('students-by-class/', StudentListView.as_view(), name='student_list_by_class_api'),
    path('save-grades/', SaveGradesAPIView.as_view(), name='save_grades_api'),
    path('teachers/', EnseignantListView.as_view(), name='teacher_list_api'),
    path('subjects/create/', ElementConstitutifCreateView.as_view(), name='subject_create_api'),
    path('subjects/<int:pk>/update/', ElementConstitutifUpdateView.as_view(), name='subject_update_api'),
    path('subjects/<int:pk>/delete/', ElementConstitutifDeleteView.as_view(), name='subject_delete_api'),
    path('ues/', UniteEnseignementListView.as_view(), name='ue_list_api'),
]