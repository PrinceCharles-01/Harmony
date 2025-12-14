import os
import sys
sys.path.append('/app/Harmony_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'harmony_backend.settings')
import django
django.setup()

from academics.models import Semestre, UniteEnseignement, MaquettePedagogique, Niveau, Cycle, Filiere, Parcours
from django.db import connection

# Vérifier si la table maquettepedagogique existe
with connection.cursor() as cursor:
    cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'academics_maquettepedagogique');")
    exists = cursor.fetchone()[0]
    print(f'La table academics_maquettepedagogique existe: {exists}')

# Créer des données de test
filiere, _ = Filiere.objects.get_or_create(nom='Informatique de Test', code='INFOTEST')
parcours, _ = Parcours.objects.get_or_create(filiere=filiere, nom='Génie Logiciel Test', code='GLTEST')
cycle, _ = Cycle.objects.get_or_create(nom='Licence Test', code='LTEST')
niveau, _ = Niveau.objects.get_or_create(cycle=cycle, numero=1, nom_complet='Licence 1 Test')
semestre, _ = Semestre.objects.get_or_create(niveau=niveau, numero=1)
ue1, _ = UniteEnseignement.objects.get_or_create(nom='UE Test 1', code='UETEST1')
ue2, _ = UniteEnseignement.objects.get_or_create(nom='UE Test 2', code='UETEST2')

# Lier les UE au semestre via MaquettePedagogique
maq1, _ = MaquettePedagogique.objects.get_or_create(semestre=semestre, ue=ue1, defaults={'coefficient': 2})
maq2, _ = MaquettePedagogique.objects.get_or_create(semestre=semestre, ue=ue2, defaults={'coefficient': 3})

# Vérifier les relations
print(f'UEs pour le semestre {semestre}:')
for ue in semestre.ues.all():
    maq = MaquettePedagogique.objects.get(semestre=semestre, ue=ue)
    print(f'- {ue.nom} (Code: {ue.code}), Coefficient: {maq.coefficient}')

# Nettoyer les données de test
semestre.delete()
niveau.delete()
cycle.delete()
parcours.delete()
filiere.delete()
ue1.delete()
ue2.delete()
print('Données de test nettoyées.')