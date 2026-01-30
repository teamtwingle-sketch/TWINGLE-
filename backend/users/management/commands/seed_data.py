
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
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))
