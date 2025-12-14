from rest_framework import viewsets, views, status
from rest_framework.response import Response
from .models import Cours, SessionCours, Salle, AnneeAcademique, Contrainte, Classe
from .serializers import (
    CoursDetailSerializer, CoursWriteSerializer, 
    SessionCoursSerializer, SessionCoursWriteSerializer,
    SalleSerializer, ContrainteSerializer, ScheduleSerializer
)
import datetime
from decimal import Decimal
# from ortools.sat.python import cp_model # Not used in current heuristic
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny

from .services.scheduling_service import SchedulingService # Updated import

class ContrainteViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing constraints.
    """
    queryset = Contrainte.objects.all()
    serializer_class = ContrainteSerializer

# from .services import generate_heuristic_schedule, generate_ortools_schedule # Removed

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class PlanifierEmploiDuTempsView(views.APIView):
    """
    Endpoint pour lancer la génération de l'emploi du temps.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        annee_academique_id = request.data.get('annee_academique_id')
        # algorithm = request.data.get('algorithm', 'heuristic') # Algorithm selection handled by service

        if not annee_academique_id:
            return Response({'error': 'annee_academique_id est requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            annee = AnneeAcademique.objects.get(id=annee_academique_id)
        except AnneeAcademique.DoesNotExist:
            return Response({'error': 'Année académique non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

        # Clear existing sessions for this academic year before rescheduling
        SessionCours.objects.filter(cours__annee_academique=annee).delete()

        # Fetch necessary data for the scheduler
        classes_to_schedule = list(Classe.objects.filter(annee_academique=annee))
        available_salles = list(Salle.objects.all())

        if not classes_to_schedule:
            return Response({'message': 'Aucune classe à planifier pour cette année.'}, status=status.HTTP_200_OK)
        if not available_salles:
            return Response({'error': 'Aucune salle disponible.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            scheduler = SchedulingService(annee_academique=annee)
            scheduled_sessions, unscheduled_courses = scheduler.generate_schedule(
                classes_to_schedule=classes_to_schedule,
                available_salles=available_salles,
                working_days=[0, 1, 2, 3, 4], # Monday to Friday (example, can be configurable)
                daily_start_time=datetime.time(8, 0), # 8 AM (example, can be configurable)
                daily_end_time=datetime.time(18, 0), # 6 PM (example, can be configurable)
                session_duration=datetime.timedelta(hours=1, minutes=30), # 1h30 sessions (example, can be configurable)
                break_duration=datetime.timedelta(minutes=15) # 15 min break (example, can be configurable)
            )

            if unscheduled_courses:
                # If there are unscheduled courses, return a partial success or a warning
                unscheduled_names = [f"{c.element_constitutif.nom} ({c.classe.nom})" for c in unscheduled_courses]
                return Response({
                    'message': f"{len(scheduled_sessions)} sessions créées avec succès. {len(unscheduled_courses)} cours n'ont pas pu être planifiés.",
                    'scheduled_count': len(scheduled_sessions),
                    'unscheduled_courses': unscheduled_names
                }, status=status.HTTP_206_PARTIAL_CONTENT)
            else:
                return Response({
                    'message': f'{len(scheduled_sessions)} sessions créées avec succès.',
                    'scheduled_count': len(scheduled_sessions)
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f'Une erreur inattendue est survenue lors de la planification: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SalleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows rooms to be viewed or edited.
    """
    queryset = Salle.objects.all()
    serializer_class = SalleSerializer

class CoursViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows courses to be viewed or edited.
    """
    queryset = Cours.objects.all()

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return CoursDetailSerializer
        return CoursWriteSerializer

class SessionCoursViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows course sessions to be viewed or edited.
    """
    queryset = SessionCours.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return SessionCoursSerializer
        return SessionCoursWriteSerializer

class ScheduleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing the schedule.
    """
    queryset = SessionCours.objects.all()
    serializer_class = ScheduleSerializer