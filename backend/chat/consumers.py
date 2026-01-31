
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import json

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = await self.get_user_from_token()
        
        if self.user is None:
            await self.close()
            return

        self.user_group_name = f"user_{self.user.id}"

        # Join room group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get('type')

            if msg_type == 'typing':
                receiver_id = data.get('receiver_id')
                if receiver_id:
                    # Forward typing signal to recipient
                    await self.channel_layer.group_send(
                        f"user_{receiver_id}",
                        {
                            'type': 'typing_signal',
                            'sender_id': self.user.id
                        }
                    )
        except Exception as e:
            pass

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def typing_signal(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'sender_id': event['sender_id']
        }))

    @database_sync_to_async
    def get_user_from_token(self):
        try:
            query_string = self.scope['query_string'].decode()
            params = {}
            if query_string:
                params = dict(x.split('=') for x in query_string.split('&') if '=' in x)
            
            token_str = params.get('token')
            if not token_str:
                return None
                
            access_token = AccessToken(token_str)
            user_id = access_token.payload['user_id']
            return User.objects.get(id=user_id)
        except Exception as e:
            return None
