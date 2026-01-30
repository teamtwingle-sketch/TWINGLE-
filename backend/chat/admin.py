from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'content', 'timestamp')
    list_filter = ('timestamp', 'message_type')
    search_fields = ('sender__email', 'receiver__email', 'content')
    readonly_fields = ('sender', 'receiver', 'timestamp', 'content') 
    # Read-only to prevent tampering, but allow deletion
