
from django.core.management.base import BaseCommand
from profiles.models import Interest
from payments.models import SubscriptionPlan

class Command(BaseCommand):
    help = 'Seeds initial data'

    def handle(self, *args, **options):
        # Interests
        interests = ['Movies', 'Travel', 'Fitness', 'Music', 'Gaming', 'Food', 'Photography', 'Tech', 'Reading', 'Cricket', 'Football', 'Cooking']
        for name in interests:
            Interest.objects.get_or_create(name=name)
        
        # Plans
        SubscriptionPlan.objects.get_or_create(
            name='Gold', 
            price=199, 
            duration_days=30, 
            description='Unlimited swipes, rewind, no ads'
        )
        SubscriptionPlan.objects.get_or_create(
            name='Platinum', 
            price=499, 
            duration_days=90, 
            description='Priority likes, profile boost, all gold features'
        )
        
        # Superuser
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if not User.objects.filter(email='admin@twingle.com').exists():
            User.objects.create_superuser('admin@twingle.com', 'admin@8567')
            self.stdout.write(self.style.SUCCESS('Created superuser: admin@twingle.com / admin@8567'))
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))
