from django.urls import path
from .views import UserCreateAPIView, TestUserCreationView, EnrollStudentAPIView, TestInterfaceView, UserListView, FiliereListView, NiveauListView, AssignAcademicInfoAPIView, StudentGradesAPIView

urlpatterns = [
    path('create-user/', UserCreateAPIView.as_view(), name='create_user_api'),
    path('enroll-student/', EnrollStudentAPIView.as_view(), name='enroll_student_api'),
    path('test-user-creation/', TestUserCreationView.as_view(), name='test_user_creation'),
    path('test-interface/', TestInterfaceView.as_view(), name='test_interface'),
    path('users/', UserListView.as_view(), name='user_list_api'),
    path('filieres/', FiliereListView.as_view(), name='filiere_list_api'),
    path('niveaux/', NiveauListView.as_view(), name='niveau_list_api'),
    path('assign-academic-info/', AssignAcademicInfoAPIView.as_view(), name='assign_academic_info_api'),
    path('student-grades/', StudentGradesAPIView.as_view(), name='student_grades_api'),
]