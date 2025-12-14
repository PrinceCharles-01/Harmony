import datetime
from decimal import Decimal
from .models import SessionCours
from ortools.sat.python import cp_model

def _is_teacher_busy(enseignant, start_time, end_time, sessions_existantes):
    for session in sessions_existantes:
        if session.cours.enseignant == enseignant and session.date_debut < end_time and session.date_fin > start_time:
            return True
    return False

def _is_class_busy(classe, start_time, end_time, sessions_existantes):
    if not classe:
        return False
    for session in sessions_existantes:
        if session.cours.classe == classe and session.date_debut < end_time and session.date_fin > start_time:
            return True
    return False

def _is_room_busy(salle, start_time, end_time, sessions_existantes):
    for session in sessions_existantes:
        if session.salle == salle and session.date_debut < end_time and session.date_fin > start_time:
            return True
    return False

def _is_slot_constrained(start_time, end_time, cours, constraints, daily_teacher_hours):
    day_of_week = start_time.weekday()
    
    for c in constraints:
        if c.type_contrainte == 'JOUR_BLOQUE':
            if c.date_debut and c.date_fin and c.date_debut <= start_time < c.date_fin:
                return True

        if c.type_contrainte == 'INDISPONIBILITE_ENSEIGNANT' and c.enseignant == cours.enseignant:
            if c.date_debut and c.date_fin and c.date_debut <= start_time < c.date_fin:
                return True
            if c.jour_semaine is not None and c.jour_semaine == day_of_week:
                if not c.date_debut or not c.date_fin:
                    return True
                if c.date_debut.time() <= start_time.time() and c.date_fin.time() >= end_time.time():
                    return True

        if c.type_contrainte == 'HEURES_MAX_JOUR_ENSEIGNANT' and c.enseignant == cours.enseignant:
            teacher_id = cours.enseignant.id
            day_key = start_time.date()
            max_hours = Decimal(c.valeur_json.get('heures_max', 999))
            if daily_teacher_hours.get(teacher_id, {}).get(day_key, 0) + 2 > max_hours:
                return True

    return False

from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def generate_heuristic_schedule(annee, cours_a_planifier, salles_disponibles, constraints, sessions_existantes):
    heures_planifiees = {c.id: Decimal('0.0') for c in cours_a_planifier}
    daily_teacher_hours = {}
    jours_semaine = range(0, 6)
    heures_debut = range(8, 18, 2)
    MAX_WEEKS = 20

    start_date_of_week = annee.date_debut - datetime.timedelta(days=annee.date_debut.weekday())
    new_sessions = []

    for week in range(MAX_WEEKS):
        current_week_date = start_date_of_week + datetime.timedelta(weeks=week)
        for cours in cours_a_planifier:
            while heures_planifiees[cours.id] < cours.volume_horaire_total:
                slot_trouve = False
                for jour_offset in jours_semaine:
                    for heure in heures_debut:
                        date_debut_session = datetime.datetime.combine(current_week_date + datetime.timedelta(days=jour_offset), datetime.time(hour=heure))
                        date_fin_session = date_debut_session + datetime.timedelta(hours=2)

                        all_sessions = sessions_existantes + new_sessions
                        if _is_teacher_busy(cours.enseignant, date_debut_session, date_fin_session, all_sessions):
                            continue
                        if _is_class_busy(cours.classe, date_debut_session, date_fin_session, all_sessions):
                            continue
                        if _is_slot_constrained(date_debut_session, date_fin_session, cours, constraints, daily_teacher_hours):
                            continue
                        
                        for salle in salles_disponibles:
                            if not _is_room_busy(salle, date_debut_session, date_fin_session, all_sessions):
                                new_session = SessionCours(
                                    cours=cours,
                                    date_debut=date_debut_session,
                                    date_fin=date_fin_session,
                                    salle=salle,
                                    type_session='CM'
                                )
                                new_sessions.append(new_session)
                                heures_planifiees[cours.id] += Decimal('2.0')
                                
                                teacher_id = cours.enseignant.id
                                day_key = date_debut_session.date()
                                daily_teacher_hours.setdefault(teacher_id, {})[day_key] = daily_teacher_hours.get(teacher_id, {}).get(day_key, 0) + 2
                                
                                slot_trouve = True
                                break
                        if slot_trouve:
                            break
                if slot_trouve:
                    break
        
        if all(h >= c.volume_horaire_total for c, h in zip(cours_a_planifier, heures_planifiees.values())):
            break

    SessionCours.objects.bulk_create(new_sessions)
    return new_sessions

@csrf_exempt
def generate_ortools_schedule(annee, cours_a_planifier, salles_disponibles, constraints, sessions_existantes):
    model = cp_model.CpModel()

    cours_indices = {c.id: i for i, c in enumerate(cours_a_planifier)}
    salle_indices = {s.id: i for i, s in enumerate(salles_disponibles)}
    enseignant_indices = {t.id: i for i, t in enumerate(list(set(c.enseignant for c in cours_a_planifier)))}
    classe_indices = {cl.id: i for i, cl in enumerate(list(set(c.classe for c in cours_a_planifier if c.classe)))}

    num_jours = 6
    num_slots_par_jour = 5
    slots = range(num_jours * num_slots_par_jour)

    sessions = {}
    for c_idx, c in enumerate(cours_a_planifier):
        for slot in slots:
            for r_idx, r in enumerate(salles_disponibles):
                sessions[(c_idx, slot, r_idx)] = model.NewBoolVar(f'session_c{c_idx}_s{slot}_r{r_idx}')

    for c_idx, c in enumerate(cours_a_planifier):
        heures_requises = int(c.volume_horaire_total)
        sessions_requises = heures_requises // 2
        model.Add(sum(sessions[(c_idx, slot, r_idx)] for slot in slots for r_idx in range(len(salles_disponibles))) == sessions_requises)

    for t_id in enseignant_indices.keys():
        for slot in slots:
            model.Add(sum(sessions[(c_idx, slot, r_idx)] 
                          for c_idx, c in enumerate(cours_a_planifier) if c.enseignant.id == t_id
                          for r_idx in range(len(salles_disponibles))) <= 1)

    for cl_id in classe_indices.keys():
        for slot in slots:
            model.Add(sum(sessions[(c_idx, slot, r_idx)] 
                          for c_idx, c in enumerate(cours_a_planifier) if c.classe.id == cl_id
                          for r_idx in range(len(salles_disponibles))) <= 1)

    for r_idx in range(len(salles_disponibles)):
        for slot in slots:
            model.Add(sum(sessions[(c_idx, slot, r_idx)] for c_idx in range(len(cours_a_planifier))) <= 1)

    start_date_of_week = annee.date_debut - datetime.timedelta(days=annee.date_debut.weekday())
    for constraint in constraints:
        if constraint.type_contrainte == 'JOUR_BLOQUE':
            for day_offset in range(num_jours):
                for hour_offset in range(num_slots_par_jour):
                    slot_time = datetime.datetime.combine(start_date_of_week + datetime.timedelta(days=day_offset), datetime.time(hour=8+hour_offset*2))
                    if constraint.date_debut <= slot_time < constraint.date_fin:
                        slot = day_offset * num_slots_par_jour + hour_offset
                        for c_idx in range(len(cours_a_planifier)):
                            for r_idx in range(len(salles_disponibles)):
                                model.Add(sessions[(c_idx, slot, r_idx)] == 0)

        elif constraint.type_contrainte == 'INDISPONIBILITE_ENSEIGNANT' and constraint.enseignant:
            t_id = constraint.enseignant.id
            if t_id in enseignant_indices:
                for c_idx, c in enumerate(cours_a_planifier):
                    if c.enseignant_id == t_id:
                        for day_offset in range(num_jours):
                            for hour_offset, h in enumerate(range(8, 18, 2)):
                                slot = day_offset * num_slots_par_jour + hour_offset
                                slot_time = datetime.datetime.combine(start_date_of_week + datetime.timedelta(days=day_offset), datetime.time(hour=h))
                                if constraint.date_debut <= slot_time < constraint.date_fin:
                                    for r_idx in range(len(salles_disponibles)):
                                        model.Add(sessions[(c_idx, slot, r_idx)] == 0)
        
        elif constraint.type_contrainte == 'HEURES_MAX_JOUR_ENSEIGNANT' and constraint.enseignant:
            t_id = constraint.enseignant.id
            if t_id in enseignant_indices:
                max_sessions = int(Decimal(constraint.valeur_json.get('heures_max', 8)) / 2)
                for day_offset in range(num_jours):
                    daily_slots = [s for s in slots if s // num_slots_par_jour == day_offset]
                    model.Add(sum(sessions[(c_idx, slot, r_idx)]
                                  for c_idx, c in enumerate(cours_a_planifier) if c.enseignant_id == t_id
                                  for slot in daily_slots
                                  for r_idx in range(len(salles_disponibles))) <= max_sessions)

    solver = cp_model.CpSolver()
    solver_status = solver.Solve(model)

    if solver_status == cp_model.OPTIMAL or solver_status == cp_model.FEASIBLE:
        sessions_to_create = []
        for (c_idx, slot, r_idx), var in sessions.items():
            if solver.Value(var):
                cours = cours_a_planifier[c_idx]
                salle = salles_disponibles[r_idx]
                
                day_offset = slot // num_slots_par_jour
                hour_offset = slot % num_slots_par_jour
                heure = [8, 10, 12, 14, 16][hour_offset]

                date_debut_session = datetime.datetime.combine(start_date_of_week + datetime.timedelta(days=day_offset), datetime.time(hour=heure))
                date_fin_session = date_debut_session + datetime.timedelta(hours=2)

                sessions_to_create.append(
                    SessionCours(
                        cours=cours,
                        date_debut=date_debut_session,
                        date_fin=date_fin_session,
                        salle=salle,
                        type_session='CM'
                    )
                )
        SessionCours.objects.bulk_create(sessions_to_create)
        return sessions_to_create
    else:
        return None
