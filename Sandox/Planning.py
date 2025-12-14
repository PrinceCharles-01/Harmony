# Prototype scheduling script
# This script creates a basic scheduler for university timetables.
# It supports:
# - configurable breaks between lessons (in minutes)
# - fixed timeslots per day (you define start/end times)
# - courses with total hours to distribute
# - classes (groups), teachers, rooms
# - shared courses across multiple classes (allowed to have same teacher at same time)
# - constraint: a teacher cannot be in two different classes at same time unless it's the same course
# - constraint: a class cannot have two courses at same time
# - simple greedy placement algorithm (place bigger demands first)
#
# Run to see a sample schedule generated for a week.

from readline import redisplay
import pandas as pd
from datetime import datetime, timedelta, time
from itertools import product
import math

# --- Data model ---
class Teacher:
    def __init__(self, id, name):
        self.id = id
        self.name = name

class Room:
    def __init__(self, id, name, capacity=30):
        self.id = id
        self.name = name
        self.capacity = capacity

class ClassGroup:
    def __init__(self, id, name, size=25):
        self.id = id
        self.name = name
        self.size = size

class Course:
    def __init__(self, id, name, teacher_id, groups, total_hours):
        """
        groups: list of class ids this course targets (can be multiple for shared lessons)
        total_hours: total hours to schedule per planning period (e.g., per semester)
        """
        self.id = id
        self.name = name
        self.teacher_id = teacher_id
        self.groups = groups[:]  # list of class ids
        self.total_hours = total_hours
        self.remaining_hours = total_hours

class TimeSlot:
    def __init__(self, day, start: time, end: time):
        self.day = day
        self.start = start
        self.end = end
        # compute duration in minutes
        dt1 = datetime.combine(datetime.today(), self.start)
        dt2 = datetime.combine(datetime.today(), self.end)
        self.duration_minutes = int((dt2 - dt1).total_seconds() / 60)
    def __repr__(self):
        return f"{self.day} {self.start.strftime('%H:%M')}-{self.end.strftime('%H:%M')}"

# --- Scheduling engine ---
class Scheduler:
    def __init__(self, teachers, rooms, classes, courses, timeslots,
                 break_between_minutes=15):
        self.teachers = {t.id: t for t in teachers}
        self.rooms = {r.id: r for r in rooms}
        self.classes = {c.id: c for c in classes}
        self.courses = {c.id: c for c in courses}
        self.timeslots = timeslots[:]  # list of TimeSlot
        self.break_between_minutes = break_between_minutes

        # state: assignments -> list of dicts
        # each assignment: {timeslot, course_id, teacher_id, room_id, groups(list)}
        self.assignments = []

        # helper indexes to check availability quickly
        # map (day, timeslot_start) -> list of assignments
        self.slot_index = {}

    def is_teacher_available(self, teacher_id, slot, course_id):
        """Teacher available at this slot unless already assigned to a different course in another class.
           If teacher teaches the same course to multiple classes in the same slot, that's allowed.
           Also enforce break: teacher cannot teach in adjacent slots violating break rule."""
        # check existing assignments at this slot for this teacher
        for a in self.assignments:
            if a['teacher_id'] == teacher_id and a['timeslot'] == slot:
                # allowed only if same course id
                if a['course_id'] != course_id:
                    return False

        # check for break constraints: find teacher's last assignment before slot on same day
        # ensure gap >= break
        slot_start_dt = datetime.combine(datetime.today(), slot.start)
        for a in self.assignments:
            if a['teacher_id'] == teacher_id:
                s = a['timeslot']
                if s.day == slot.day:
                    a_end = datetime.combine(datetime.today(), s.end)
                    # if previous assignment ends after new start -> conflict
                    # else ensure gap >= break
                    if a_end <= slot_start_dt:
                        gap = (slot_start_dt - a_end).total_seconds() / 60
                        if gap < self.break_between_minutes and a_end != slot_start_dt:
                            return False
                    else:
                        # teacher has an assignment that ends after this slot starts => overlap
                        a_start = datetime.combine(datetime.today(), s.start)
                        slot_end_dt = datetime.combine(datetime.today(), slot.end)
                        if not (a_end <= slot_start_dt or a_start >= slot_end_dt):
                            # overlap
                            if a['course_id'] != course_id:
                                return False
        return True

    def is_class_available(self, class_id, slot):
        """Class must not have another assignment at the given slot. Also enforce breaks."""
        for a in self.assignments:
            if class_id in a['groups'] and a['timeslot'] == slot:
                return False

        slot_start_dt = datetime.combine(datetime.today(), slot.start)
        for a in self.assignments:
            if class_id in a['groups']:
                s = a['timeslot']
                if s.day == slot.day:
                    a_end = datetime.combine(datetime.today(), s.end)
                    if a_end <= slot_start_dt:
                        gap = (slot_start_dt - a_end).total_seconds() / 60
                        if gap < self.break_between_minutes and a_end != slot_start_dt:
                            return False
                    else:
                        a_start = datetime.combine(datetime.today(), s.start)
                        slot_end_dt = datetime.combine(datetime.today(), slot.end)
                        if not (a_end <= slot_start_dt or a_start >= slot_end_dt):
                            return False
        return True

    def is_room_available(self, room_id, slot):
        for a in self.assignments:
            if a['room_id'] == room_id and a['timeslot'] == slot:
                return False
        return True

    def find_room_for_groups(self, groups, slot):
        """Find a room that fits all groups (for simplicity assume combined size is sum)"""
        total_size = sum(self.classes[g].size for g in groups)
        # filter rooms by capacity and availability
        for r in self.rooms.values():
            if r.capacity >= total_size and self.is_room_available(r.id, slot):
                return r.id
        return None

    def assign(self):
        """Simple greedy: sort courses by remaining hours desc, try to place them in earliest slots."""
        # convert remaining_hours to minutes for placement
        course_list = sorted(self.courses.values(), key=lambda c: c.remaining_hours, reverse=True)

        # create map of slot durations in minutes
        slot_durations = {slot: slot.duration_minutes for slot in self.timeslots}

        # We'll repeatedly try to place one slot at a time for each course until no more placement possible
        progress = True
        while progress:
            progress = False
            # update sort each loop by remaining hours
            course_list = sorted([c for c in self.courses.values() if c.remaining_hours > 0],
                                 key=lambda c: c.remaining_hours, reverse=True)
            if not course_list:
                break
            for course in course_list:
                placed = False
                # try each timeslot
                for slot in self.timeslots:
                    # timeslot must be able to host at least a minimal session (we treat full slot)
                    slot_minutes = slot.duration_minutes
                    if slot_minutes <= 0:
                        continue
                    # If course needs fewer minutes than slot, we still place it (partial slot usage) but
                    # for simplicity we will consume the whole slot_minutes from remaining_hours.
                    teacher_ok = self.is_teacher_available(course.teacher_id, slot, course.id)
                    # all groups must be available simultaneously
                    groups_ok = all(self.is_class_available(g, slot) for g in course.groups)
                    if not (teacher_ok and groups_ok):
                        continue
                    room_id = self.find_room_for_groups(course.groups, slot)
                    if room_id is None:
                        continue
                    # All good -> create assignment
                    assignment = {
                        'timeslot': slot,
                        'course_id': course.id,
                        'course_name': course.name,
                        'teacher_id': course.teacher_id,
                        'teacher_name': self.teachers[course.teacher_id].name,
                        'room_id': room_id,
                        'room_name': self.rooms[room_id].name,
                        'groups': course.groups[:],
                        'minutes': slot_minutes
                    }
                    self.assignments.append(assignment)
                    # consume minutes from course.remaining_hours
                    course.remaining_hours = max(0, course.remaining_hours - slot_minutes)
                    progress = True
                    placed = True
                    break
                # continue to next course
            # loop repeats until no placement in an iteration

    def to_dataframe(self):
        rows = []
        for a in sorted(self.assignments, key=lambda x: (x['timeslot'].day, x['timeslot'].start)):
            rows.append({
                'Day': a['timeslot'].day,
                'Time': f"{a['timeslot'].start.strftime('%H:%M')} - {a['timeslot'].end.strftime('%H:%M')}",
                'Course': a['course_name'],
                'Groups': ", ".join(a['groups']),
                'Teacher': a['teacher_name'],
                'Room': a['room_name'],
                'Minutes': a['minutes']
            })
        return pd.DataFrame(rows)

# --- Example usage with sample data ---

# Define teachers
teachers = [
    Teacher("t1", "Mme. Ella"),
    Teacher("t2", "M. Nguema"),
    Teacher("t3", "Mme. Koué")
]

# Rooms
rooms = [
    Room("r1", "Amphi A1", capacity=120),
    Room("r2", "Salle B1", capacity=40),
    Room("r3", "TP 1", capacity=25),
]

# Classes (groups)
classes = [
    ClassGroup("c1", "L1 Info", size=30),
    ClassGroup("c2", "L2 Info", size=28),
    ClassGroup("c3", "L1 Math", size=25),
]

# Courses: some target single class, one is shared across two classes
courses = [
    Course("co1", "Algorithmique", "t1", ["c1"], total_hours=120),  # 120 minutes * many slots
    Course("co2", "Mathématiques", "t2", ["c1", "c3"], total_hours=90),  # shared course for c1 & c3
    Course("co3", "Réseaux", "t3", ["c2"], total_hours=60),
    Course("co4", "Système", "t1", ["c2"], total_hours=60),
    Course("co5", "Anglais", "t2", ["c1"], total_hours=30),
]

# Timeslots: define 5 days, with 3 slots per day (for example)
days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
times = [
    (time(8,0), time(9,30)),   # 90 minutes
    (time(10,0), time(11,30)), # 90 minutes
    (time(13,30), time(15,0)), # 90 minutes
]

timeslots = [TimeSlot(d, s, e) for d, (s,e) in product(days, times)]

# Create scheduler with 15 minutes break by default
sched = Scheduler(teachers, rooms, classes, courses, timeslots, break_between_minutes=15)
sched.assign()

# Show resulting schedule
df = sched.to_dataframe()
print(df)


# Also print summary of unplaced hours
unplaced = []
for c in courses:
    if c.remaining_hours > 0:
        unplaced.append((c.name, c.remaining_hours))
unplaced_df = pd.DataFrame(unplaced, columns=["Course", "RemainingMinutes"])
if not unplaced_df.empty:
    print("\nCours avec heures non placées (minutes restantes):")
    redisplay(unplaced_df)
else:
    print("\nToutes les heures demandées ont été placées (ou consommées par les slots disponibles).")


