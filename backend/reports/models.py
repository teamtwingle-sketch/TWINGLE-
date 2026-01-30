
from django.db import models
from django.conf import settings

class Report(models.Model):
    REASON_CHOICES = (
        ('fake_profile', 'Fake Profile'),
        ('harassment', 'Harassment'),
        ('abuse', 'Abuse'),
        ('scam', 'Scam or Money Request'),
        ('inappropriate', 'Inappropriate Behavior'),
        ('other', 'Other'),
    )
    
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_filed')
    reported_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_received')
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    explanation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)
    action_taken = models.CharField(max_length=100, blank=True) # e.g. "Banned"
    
    def __str__(self):
        return f"Report against {self.reported_user.email}"

class Block(models.Model):
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blocked_users')
    blocked_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blocked_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('blocker', 'blocked_user')

    def __str__(self):
        return f"{self.blocker} blocked {self.blocked_user}"
