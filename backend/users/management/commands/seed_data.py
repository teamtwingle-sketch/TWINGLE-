
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
        # Plans
        SubscriptionPlan.objects.update_or_create(
            name='Gold', 
            defaults={
                'price': 30, 
                'duration_days': 30, 
                'description': '60 swipes/day, rewind, no ads'
            }
        )
        SubscriptionPlan.objects.update_or_create(
            name='Platinum', 
            defaults={
                'price': 400, 
                'duration_days': 90, 
                'description': 'Unlimited swipes, priority likes, profile boost'
            }
        )
        
        # Superuser
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if not User.objects.filter(email='admin@twingle.com').exists():
            User.objects.create_superuser('admin@twingle.com', 'Ad#.867.cat')
            self.stdout.write(self.style.SUCCESS('Created superuser: admin@twingle.com / Ad#.867.cat'))
        else:
            # Update password if exists
            u = User.objects.get(email='admin@twingle.com')
            u.set_password('Ad#.867.cat')
            u.save()
            self.stdout.write(self.style.SUCCESS('Updated superuser password to: Ad#.867.cat'))
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))
