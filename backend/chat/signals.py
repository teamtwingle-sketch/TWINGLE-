
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ChatMessage

@receiver(post_save, sender=ChatMessage)
def send_chat_notification(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        
        # Send to Recipient (Real-Time Notification)
        async_to_sync(channel_layer.group_send)(
            f"user_{instance.receiver.id}",
            {
                'type': 'chat_message',
                'message': {
                    'id': instance.id,
                    'content': instance.content,
                    'sender': instance.sender.id,
                    'receiver': instance.receiver.id,
                    'is_me': False, # Flag for recipient
                    'timestamp': str(instance.timestamp),
                    'message_type': instance.message_type,
                    'reply_to': {
                        'id': instance.parent_message.id,
                        'content': instance.parent_message.content,
                        'sender': instance.parent_message.sender.first_name
                    } if instance.parent_message else None
                }
            }
        )

        # Send to Sender (Real-Time Confirmation/Echo for other tabs)
        async_to_sync(channel_layer.group_send)(
            f"user_{instance.sender.id}",
            {
                'type': 'chat_message',
                'message': {
                    'id': instance.id,
                    'content': instance.content,
                    'sender': instance.sender.id,
                    'receiver': instance.receiver.id,
                    'is_me': True, # Flag for sender
                    'timestamp': str(instance.timestamp),
                    'message_type': instance.message_type,
                    'reply_to': {
                        'id': instance.parent_message.id,
                        'content': instance.parent_message.content,
                        'sender': instance.parent_message.sender.first_name
                    } if instance.parent_message else None
                }
            }
        )
