
import os, django, sys
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dating_core.settings")
django.setup()
from payments.models import SubscriptionPlan

# Gold
p1, _ = SubscriptionPlan.objects.get_or_create(name='Gold')
p1.price = 60.00
p1.description = "60 Swipes/Day, See who likes you, Priority Support"
p1.duration_days = 30
p1.save()

# Platinum
p2, _ = SubscriptionPlan.objects.get_or_create(name='Platinum')
p2.price = 300.00
p2.description = "Unlimited Swipes, Travel Mode, Ad-free experience"
p2.duration_days = 90
p2.save()

print("Plans updated")
