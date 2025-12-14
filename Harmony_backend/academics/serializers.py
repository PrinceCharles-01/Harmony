from rest_framework import serializers
from .models import Cours, SessionCours, ElementConstitutif, UniteEnseignement, Classe, Salle, Contrainte
from users.models import Enseignant, CustomUser

class ContrainteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrainte
        fields = '__all__'

# Serializer pour les Salles
class SalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salle
        fields = ['id', 'nom', 'capacite', 'type_salle']

# Serializer simple pour le nom de l'enseignant
class EnseignantNameSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Enseignant
        fields = ['full_name']

    def get_full_name(self, obj):
        if obj.user:
            return obj.user.get_full_name()
        return "N/A"

# Serializer pour l'UE (juste le nom)
class UniteEnseignementNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = UniteEnseignement
        fields = ['nom']

# Serializer pour la matière qui inclut le nom de l'UE
class ElementConstitutifDetailSerializer(serializers.ModelSerializer):
    ue = UniteEnseignementNameSerializer(read_only=True)
    class Meta:
        model = ElementConstitutif
        fields = ['nom', 'ue']

# Serializer pour le Cours qui inclut les détails de la matière et de l'enseignant
class CoursDetailSerializer(serializers.ModelSerializer):
    element_constitutif = ElementConstitutifDetailSerializer(read_only=True)
    enseignant = EnseignantNameSerializer(read_only=True)
    
    class Meta:
        model = Cours
        fields = ['id', 'element_constitutif', 'enseignant', 'volume_horaire_total']

# Serializer principal pour les sessions de cours, maintenant avec les données imbriquées
class SessionCoursSerializer(serializers.ModelSerializer):
    cours = CoursDetailSerializer(read_only=True)
    salle = SalleSerializer(read_only=True, allow_null=True)

    class Meta:
        model = SessionCours
        fields = ['id', 'date_debut', 'date_fin', 'salle', 'type_session', 'cours']

# --- Serializers pour l'écriture (Create/Update) ---
# Gardons les serializers de base pour les opérations d'écriture afin de rester simple

class CoursWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cours
        fields = '__all__'

class SessionCoursWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionCours
        fields = '__all__'

class ScheduleSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source='cours.element_constitutif.nom', allow_null=True)
    type = serializers.CharField(source='type_session')
    time = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField() # Changed to SerializerMethodField
    room = serializers.CharField(source='salle.nom', allow_null=True)
    professor = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    ue = serializers.CharField(source='cours.element_constitutif.ue.nom', allow_null=True)

    class Meta:
        model = SessionCours
        fields = ['subject', 'type', 'time', 'date', 'room', 'professor', 'color', 'ue']

    def get_time(self, obj):
        if obj.date_debut and obj.date_fin:
            return f"{obj.date_debut.strftime('%H:%M')} - {obj.date_fin.strftime('%H:%M')}"
        return ""

    def get_professor(self, obj):
        if obj.cours and obj.cours.enseignant and obj.cours.enseignant.user:
            return obj.cours.enseignant.user.get_full_name()
        return "N/A"

    def get_color(self, obj):
        colors = {
            'Algorithmique & Programmation': 'bg-primary',
            'Systèmes & Réseaux': 'bg-emerald-500',
            'Intelligence Artificielle': 'bg-amber-500',
        }
        if obj.cours and obj.cours.element_constitutif and obj.cours.element_constitutif.ue:
            return colors.get(obj.cours.element_constitutif.ue.nom, 'bg-gray-500')
        return 'bg-gray-500'

    def get_date(self, obj): # New method to get only the date part
        if obj.date_debut:
            return obj.date_debut.strftime('%Y-%m-%d') # Format as YYYY-MM-DD
        return None