from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CoursViewSet, SessionCoursViewSet, SalleViewSet, PlanifierEmploiDuTempsView, ContrainteViewSet, ScheduleViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'cours', CoursViewSet)
router.register(r'sessions', SessionCoursViewSet)
router.register(r'salles', SalleViewSet)
router.register(r'contraintes', ContrainteViewSet)
router.register(r'schedule', ScheduleViewSet, basename='schedule')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('planifier/', PlanifierEmploiDuTempsView.as_view(), name='planifier_emploi_du_temps'),
]
