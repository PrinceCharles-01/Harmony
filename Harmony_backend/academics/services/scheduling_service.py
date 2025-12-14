import datetime
from collections import defaultdict
from django.db import transaction
from decimal import Decimal # Added import
from academics.models.common import AnneeAcademique
from academics.models.lmd import Classe, ElementConstitutif, Cycle
from academics.models.scheduling import Cours, Salle, SessionCours
from users.models import Enseignant

class SchedulingService:
    def __init__(self, annee_academique: AnneeAcademique):
        self.annee_academique = annee_academique
        self.scheduled_sessions = []
        self.unscheduled_courses = []

        # Track availability of resources
        self.enseignant_availability = defaultdict(list) # {enseignant_id: [(start_dt, end_dt), ...]}
        self.salle_availability = defaultdict(list)      # {salle_id: [(start_dt, end_dt), ...]}
        self.classe_availability = defaultdict(list)     # {classe_id: [(start_dt, end_dt), ...]}

    def _is_available(self, resource_availability, resource_id, start_dt, end_dt, break_duration):
        """
        Checks if a resource is available during the given time slot,
        considering a break duration before and after.
        """
        for existing_start, existing_end in resource_availability[resource_id]:
            # Check for overlap
            if max(start_dt, existing_start) < min(end_dt, existing_end):
                return False # Direct overlap

            # Check for overlap with break before new session
            if existing_start <= start_dt < existing_end + break_duration:
                return False

            # Check for overlap with break after new session
            if existing_start - break_duration < end_dt <= existing_end:
                return False
        return True

    def _add_to_availability(self, resource_availability, resource_id, start_dt, end_dt):
        """Adds a new occupied slot for a resource."""
        resource_availability[resource_id].append((start_dt, end_dt))
        resource_availability[resource_id].sort() # Keep sorted for efficient checking

    @transaction.atomic
    def generate_schedule(self,
                          classes_to_schedule: list[Classe],
                          available_salles: list[Salle],
                          working_days: list[int], # 0=Monday, 6=Sunday
                          daily_start_time: datetime.time,
                          daily_end_time: datetime.time,
                          session_duration: datetime.timedelta,
                          break_duration: datetime.timedelta = datetime.timedelta(minutes=15)):
        """
        Generates a basic course schedule for the given academic year and classes.

        Args:
            classes_to_schedule: List of Classe objects for which to generate the schedule.
            available_salles: List of Salle objects that can be used.
            working_days: List of integers representing working days (0=Monday, 6=Sunday).
            daily_start_time: The earliest time a session can start each day.
            daily_end_time: The latest time a session can end each day.
            session_duration: The fixed duration for each scheduling block (e.g., 1.5 hours).
            break_duration: The minimum break duration required between sessions for a resource.

        Returns:
            A tuple containing (list of scheduled SessionCours objects, list of unscheduled Cours objects).
        """
        # Get all Cours objects relevant to the selected classes and academic year
        courses_to_schedule = Cours.objects.filter(
            annee_academique=self.annee_academique,
            classe__in=classes_to_schedule
        ).order_by('element_constitutif__nom') # Order for consistent scheduling

        # Reset availability for a new scheduling run
        self.enseignant_availability.clear()
        self.salle_availability.clear()
        self.classe_availability.clear()
        self.scheduled_sessions.clear()
        self.unscheduled_courses.clear()

        # Calculate total days in the academic year for iteration
        current_date = self.annee_academique.date_debut
        end_date = self.annee_academique.date_fin

        # Prepare a list of all possible dates within the academic year
        all_possible_dates = []
        while current_date <= end_date:
            if current_date.weekday() in working_days:
                all_possible_dates.append(current_date)
            current_date += datetime.timedelta(days=1)

        # Iterate through each course and try to schedule its sessions
        for course in courses_to_schedule:
            remaining_volume = course.volume_horaire_total
            sessions_needed = int(remaining_volume / Decimal(session_duration.total_seconds() / 3600)) # Fixed TypeError
            sessions_scheduled_for_course = 0

            # Try to schedule each required session
            for _ in range(sessions_needed):
                session_placed = False
                for current_date in all_possible_dates:
                    current_time = datetime.datetime.combine(current_date, daily_start_time)
                    while current_time + session_duration <= datetime.datetime.combine(current_date, daily_end_time):
                        session_start_dt = current_time
                        session_end_dt = current_time + session_duration

                        # Check availability for Enseignant, Classe, and find a Salle
                        enseignant_available = self._is_available(
                            self.enseignant_availability, course.enseignant.id,
                            session_start_dt, session_end_dt, break_duration
                        )
                        classe_available = self._is_available(
                            self.classe_availability, course.classe.id,
                            session_start_dt, session_end_dt, break_duration
                        )

                        if enseignant_available and classe_available:
                            # Find an available salle
                            found_salle = None
                            for salle in available_salles:
                                if self._is_available(
                                    self.salle_availability, salle.id,
                                    session_start_dt, session_end_dt, break_duration
                                ):
                                    found_salle = salle
                                    break

                            if found_salle:
                                # Schedule the session
                                session = SessionCours.objects.create(
                                    cours=course,
                                    date_debut=session_start_dt,
                                    date_fin=session_end_dt,
                                    salle=found_salle,
                                    type_session='CM' # Default to CM, can be refined later
                                )
                                self.scheduled_sessions.append(session)

                                # Update availability
                                self._add_to_availability(self.enseignant_availability, course.enseignant.id, session_start_dt, session_end_dt)
                                self._add_to_availability(self.classe_availability, course.classe.id, session_start_dt, session_end_dt)
                                self._add_to_availability(self.salle_availability, found_salle.id, session_start_dt, session_end_dt)

                                sessions_scheduled_for_course += 1
                                session_placed = True
                                break # Move to next session for this course
                        
                        # Move to the next time slot, considering break duration
                        current_time += session_duration + break_duration
                    if session_placed:
                        break # Move to next session for this course

                if not session_placed:
                    # If a session couldn't be placed, mark the course as unscheduled
                    # and stop trying to schedule more sessions for it.
                    self.unscheduled_courses.append(course)
                    break # Move to next course

        return self.scheduled_sessions, self.unscheduled_courses
