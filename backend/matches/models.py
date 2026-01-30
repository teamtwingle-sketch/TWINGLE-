
from django.db import models
from django.conf import settings

class Swipe(models.Model):
    ACTION_CHOICES = (
        ('like', 'Like'),
        ('dislike', 'Dislike'),
    )
    
    swiper = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='swipes_made')
    target = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='swipes_received')
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('swiper', 'target')

class Match(models.Model):
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='matches')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Match {self.id}"
