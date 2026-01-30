
import os
import django
import sys
from datetime import date

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dating_core.settings')
django.setup()

from users.models import User
from profiles.models import Profile, Interest
from payments.models import SubscriptionPlan

def seed_data():
    # Seed Interests
    interests_names = ["Travel", "Music", "Cooking", "Photography", "Football", "Movies", "Dancing", "Gaming"]
    for name in interests_names:
        Interest.objects.get_or_create(name=name)
    
    interests = list(Interest.objects.all())
    
    # Seed Plans
    plans_data = [
        ("Gold", 199.00, 30, "Unlimited Swipes, Rewind Swipes, No Ads"),
        ("Platinum", 499.00, 90, "All Gold Features, Profile Boost, Priority Likes"),
    ]
    for name, price, days, desc in plans_data:
        SubscriptionPlan.objects.get_or_create(
            name=name, 
            defaults={'price': price, 'duration_days': days, 'description': desc}
        )
    
    # Seed Users
    users_data = [
        ("anjali@example.com", "Anjali", "female", "male", "ernakulam"),
        ("megha@example.com", "Megha", "female", "male", "kozhikode"),
        ("rahul@example.com", "Rahul", "male", "female", "thiruvananthapuram"),
        ("arjun@example.com", "Arjun", "male", "female", "ernakulam"),
    ]
    
    for email, name, gender, pref, district in users_data:
        user, created = User.objects.get_or_create(email=email)
        if created:
            user.set_password("password123")
            user.save()
        
        profile, p_created = Profile.objects.get_or_create(user=user)
        profile.first_name = name
        profile.gender = gender
        profile.interested_in = pref
        profile.district = district
        profile.dob = date(1995, 5, 20)
        profile.bio = f"Hi, I am {name} from {district}. Looking for someone special."
        profile.relationship_intents = ["Marriage", "Serious Dating"]
        profile.save()
        
        if interests:
            profile.interests.set(interests[:3])

    print("Data seeded successfully.")

if __name__ == "__main__":
    seed_data()
