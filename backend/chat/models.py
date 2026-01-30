
from django.db import models
from django.conf import settings

class ChatMessage(models.Model):
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('voice', 'Voice'),
    )
    
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    content = models.TextField(blank=True, null=True) # For text
    voice_file = models.FileField(upload_to='chat_voice/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    parent_message = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    def __str__(self):
        return f"Message from {self.sender} to {self.receiver}"

class Call(models.Model):
    STATUS_CHOICES = (
        ('initiated', 'Initiated'),
        ('active', 'Active'),
        ('ended', 'Ended'),
        ('rejected', 'Rejected'),
    )
    caller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='initiated_calls')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_calls')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    sdp_offer = models.TextField(blank=True, null=True)
    sdp_answer = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Call {self.caller} -> {self.receiver} ({self.status})"
