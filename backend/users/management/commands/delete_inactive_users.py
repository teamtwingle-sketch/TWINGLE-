from django.core.management.base import BaseCommand
from users.models import User
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Deletes users inactive for more than 30 days'

    def handle(self, *args, **options):
        threshold = timezone.now() - timedelta(days=30)
        # Exclude staff/admin
        users = User.objects.filter(last_activity__lt=threshold).exclude(is_staff=True).exclude(is_superuser=True)
        count = users.count()
        if count > 0:
            users.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {count} inactive users'))
        else:
            self.stdout.write(self.style.SUCCESS('No inactive users found'))
