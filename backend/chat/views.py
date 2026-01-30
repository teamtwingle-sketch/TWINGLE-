
from rest_framework import viewsets, permissions, response, status, serializers, generics, views
from .models import ChatMessage
from matches.models import Match
from reports.models import Block
from django.db.models import Q
from users.models import User
from django.utils import timezone
import datetime

# Simple in-memory typing status for MVP
TYPING_STORE = {}

class MessageSerializer(serializers.ModelSerializer):
    reply_to = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('sender', 'timestamp')

    def get_reply_to(self, obj):
        if obj.parent_message:
            return {
                "id": obj.parent_message.id, 
                "content": obj.parent_message.content,
                "sender": obj.parent_message.sender.first_name
            }
        return None

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        other_user_id = self.request.query_params.get('user_id')
        if not other_user_id:
            return ChatMessage.objects.none()
        
        return ChatMessage.objects.filter(
            (Q(sender=self.request.user) & Q(receiver_id=other_user_id)) |
            (Q(sender_id=other_user_id) & Q(receiver=self.request.user))
        ).order_by('timestamp')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Update My Activity
        User.objects.filter(pk=request.user.pk).update(last_activity=timezone.now())

        # Mark as read
        if self.request.query_params.get('user_id'):
            other_uid = self.request.query_params.get('user_id')
            ChatMessage.objects.filter(
                sender_id=other_uid, 
                receiver=request.user, 
                is_read=False
            ).update(is_read=True)

        # Metadata about partner
        other_user_id = request.query_params.get('user_id')
        partner_data = {}
        if other_user_id:
            try:
                other_user = User.objects.get(pk=other_user_id)
                # Online if active in last 2 mins
                is_online = False
                if other_user.last_activity:
                    diff = timezone.now() - other_user.last_activity
                    is_online = diff.total_seconds() < 120
                
                # Check typing
                is_typing = False
                typing_key = f"{other_user_id}:{request.user.id}"
                last_typed = TYPING_STORE.get(typing_key)
                if last_typed:
                    if (datetime.datetime.now() - last_typed).total_seconds() < 3:
                        is_typing = True

                partner_data = {
                    "is_online": is_online,
                    "last_seen": other_user.last_activity,
                    "is_typing": is_typing
                }
            except User.DoesNotExist:
                pass

        return response.Response({
            "messages": serializer.data,
            "partner_status": partner_data
        })

    def create(self, request, *args, **kwargs):
        receiver_id = request.data.get('receiver')
        
        # Check for block
        is_blocked = Block.objects.filter(
            Q(blocker=request.user, blocked_user_id=receiver_id) |
            Q(blocker_id=receiver_id, blocked_user=request.user)
        ).exists()
        
        if is_blocked:
             return response.Response({"error": "You cannot message this user."}, status=status.HTTP_403_FORBIDDEN)

        # Check if matched before allowing chat
        is_matched = Match.objects.filter(users=request.user).filter(users__id=receiver_id).exists()
        if not is_matched:
            return response.Response({"error": "You must match before chatting"}, status=status.HTTP_403_FORBIDDEN)
        
        content = request.data.get('content', '')
        if "http" in content or "@" in content:
            return response.Response({"error": "External links and emails are not allowed for safety."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(sender=request.user)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)

class TypingView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        receiver_id = request.data.get('receiver_id')
        if receiver_id:
            key = f"{request.user.id}:{receiver_id}"
            TYPING_STORE[key] = datetime.datetime.now()
        return response.Response({"status": "ok"})

class ChatListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        user = request.user
        messages = ChatMessage.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('-timestamp')
        
        participants = set()
        for m in messages:
            participants.add(m.sender_id if m.sender_id != user.id else m.receiver_id)
        
        blocked_ids = set(Block.objects.filter(blocker=user).values_list('blocked_user_id', flat=True))
        blocked_by_ids = set(Block.objects.filter(blocked_user=user).values_list('blocker_id', flat=True))
            
        results = []
        for p_id in participants:
            if p_id in blocked_ids or p_id in blocked_by_ids: continue

            try:
                other_user = User.objects.get(id=p_id)
                profile = getattr(other_user, 'profile', None)
                photo = other_user.photos.filter(is_primary=True).first() or other_user.photos.first()
                last_msg = messages.filter(Q(sender_id=p_id) | Q(receiver_id=p_id)).first()
                unread_count = ChatMessage.objects.filter(sender_id=p_id, receiver=user, is_read=False).count()
                
                results.append({
                    "user_id": other_user.id,
                    "name": profile.first_name if profile else "User",
                    "photo": photo.image.url if photo and photo.image else None,
                    "last_msg": last_msg.content if last_msg and last_msg.message_type == 'text' else "Voice message",
                    "time": last_msg.timestamp if last_msg else None,
                    "unread_count": unread_count
                })
            except User.DoesNotExist:
                continue
        
        # Sort by time descend
        results.sort(key=lambda x: x['time'] if x['time'] else datetime.datetime.min.replace(tzinfo=datetime.timezone.utc), reverse=True)
            
        return response.Response(results)

from .models import Call
from rest_framework.decorators import action

class CallSerializer(serializers.ModelSerializer):
    caller_name = serializers.ReadOnlyField(source='caller.first_name')
    class Meta:
        model = Call
        fields = '__all__'

class CallViewSet(viewsets.ModelViewSet):
    queryset = Call.objects.all()
    serializer_class = CallSerializer
    permission_classes = (permissions.IsAuthenticated,)

    @action(detail=False, methods=['post'])
    def start(self, request):
        receiver_id = request.data.get('receiver')
        sdp_offer = request.data.get('sdp_offer')
        
        # Close pending calls
        Call.objects.filter(caller=request.user, status='initiated').update(status='ended')
        
        call = Call.objects.create(
            caller=request.user,
            receiver_id=receiver_id,
            sdp_offer=sdp_offer,
            status='initiated'
        )
        return response.Response(CallSerializer(call).data)

    @action(detail=True, methods=['post'])
    def answer(self, request, pk=None):
        call = self.get_object()
        sdp_answer = request.data.get('sdp_answer')
        
        if call.receiver != request.user:
            return response.Response({"error": "Not your call"}, status=403)
            
        call.sdp_answer = sdp_answer
        call.status = 'active'
        call.save()
        return response.Response(CallSerializer(call).data)
        
    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        call = self.get_object()
        if call.receiver != request.user and call.caller != request.user:
             return response.Response({"error": "Not your call"}, status=403)
        call.status = 'ended'
        call.save()
        return response.Response({"status": "ended"})

    @action(detail=False, methods=['get'])
    def poll(self, request):
        # Check incoming calls (invited)
        incoming = Call.objects.filter(
            receiver=request.user, 
            status='initiated', 
            created_at__gte=timezone.now() - datetime.timedelta(seconds=45)
        ).first()
        
        # Check updates for MY calls (initiated by me)
        my_call = Call.objects.filter(
            caller=request.user,
            updated_at__gte=timezone.now() - datetime.timedelta(seconds=10)
        ).first()

        # Check updates for active calls (where I am receiver) to see if ended
        active_incoming = Call.objects.filter(
            receiver=request.user,
            status__in=['ended', 'rejected'],
            updated_at__gte=timezone.now() - datetime.timedelta(seconds=10)
        ).first()

        data = {}
        if incoming:
            data['incoming'] = CallSerializer(incoming).data
        
        # Return status updates
        if my_call:
             data['my_call'] = CallSerializer(my_call).data
        if active_incoming:
             data['incoming_update'] = CallSerializer(active_incoming).data
            
        return response.Response(data)
