
from rest_framework import views, response, status, permissions, generics
from .models import Swipe, Match
from profiles.models import Profile
from reports.models import Block
from django.db.models import Q
from users.models import User
import random

class DiscoveryView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        profile, created = Profile.objects.get_or_create(user=user)

        # Basic filtering logic
        # 1. Not myself
        # 2. Not already swiped
        matches = Match.objects.filter(users=user)
        matched_ids = set()
        for m in matches:
             for u in m.users.all():
                 if u.id != user.id: matched_ids.add(u.id)

        swiped_ids = set(Swipe.objects.filter(swiper=user).values_list('target_id', flat=True))
        blocked_ids = set(Block.objects.filter(blocker=user).values_list('blocked_user_id', flat=True))
        blocked_by_ids = set(Block.objects.filter(blocked_user=user).values_list('blocker_id', flat=True))

        # 1. New Candidates (Unswiped)
        # Optimize with prefetch/select_related to avoid N+1 queries
        candidates = User.objects.exclude(id=user.id)\
            .exclude(id__in=swiped_ids)\
            .exclude(id__in=blocked_ids)\
            .exclude(id__in=blocked_by_ids)\
            .filter(status='active')\
            .select_related('profile')\
            .prefetch_related('photos', 'profile__interests')

        # Filter by gender interest (My preference)
        if profile.interested_in == 'male':
            candidates = candidates.filter(profile__gender='male')
        elif profile.interested_in == 'female':
            candidates = candidates.filter(profile__gender='female')

        # Reciprocal Filter: Ensure THEY are interested in ME
        if profile.gender:
            candidates = candidates.filter(
                Q(profile__interested_in=profile.gender) | 
                Q(profile__interested_in='all')
            )



        # Combined Processing
        my_intents = set(profile.relationship_intents)
        my_interests = set(profile.interests.values_list('id', flat=True))

        def score_user(c):
             if not hasattr(c, 'profile'): return None
             score = 0
             c_profile = c.profile
             
             # Intent
             c_intents = set(c_profile.relationship_intents)
             if my_intents.intersection(c_intents): score += 10
             
             # Interest
             c_interests = set(i.id for i in c_profile.interests.all()) # Optimized to use prefetch
             score += len(my_interests.intersection(c_interests)) * 2
             
             # District
             if c_profile.district == profile.district: score += 5
             
             return {
                "user_id": c.id,
                "first_name": c_profile.first_name,
                "age": c_profile.age,
                "district": c_profile.district,
                "bio": c_profile.bio,
                "photos": [p.image.url for p in c.photos.all()],
                "score": score
            }

        scored_results = []
        for c in candidates:
            res = score_user(c)
            if res: scored_results.append(res)
            
        # Sort by compatibility score
        scored_results.sort(key=lambda x: x['score'], reverse=True)
        
        return response.Response(scored_results[:10])

class MatchListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        user = request.user
        matches = Match.objects.filter(users=user)
        
        blocked_ids = set(Block.objects.filter(blocker=user).values_list('blocked_user_id', flat=True))
        blocked_by_ids = set(Block.objects.filter(blocked_user=user).values_list('blocker_id', flat=True))
        
        results = []
        for m in matches:
            other_user = m.users.exclude(id=user.id).first()
            if not other_user: continue
            if other_user.id in blocked_ids or other_user.id in blocked_by_ids: continue
            
            profile = getattr(other_user, 'profile', None)
            photo = other_user.photos.filter(is_primary=True).first() or other_user.photos.first()
            
            results.append({
                "id": m.id,
                "user_id": other_user.id,
                "name": profile.first_name if profile else "User",
                "photo": photo.image.url if photo else None,
                "last_message": "No messages yet"
            })
            
        return response.Response(results)

class SentLikesView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        
        # 1. Get everyone I liked
        my_likes = Swipe.objects.filter(swiper=user, action='like')
        liked_user_ids = my_likes.values_list('target_id', flat=True)

        # 2. Get everyone I matched with (so we can exclude them)
        matches = Match.objects.filter(users=user)
        matched_user_ids = set()
        for m in matches:
             for u in m.users.all():
                 if u.id != user.id: matched_user_ids.add(u.id)

        # 3. Filter Blocked
        blocked_ids = set(Block.objects.filter(blocker=user).values_list('blocked_user_id', flat=True))
        blocked_by_ids = set(Block.objects.filter(blocked_user=user).values_list('blocker_id', flat=True))
        
        # 4. Final List (Liked - Matched - Blocked)
        # We fetch the actual User objects now
        final_ids = set(liked_user_ids) - matched_user_ids - blocked_ids - blocked_by_ids
        
        target_users = User.objects.filter(id__in=final_ids).select_related('profile').prefetch_related('photos')
        
        results = []
        for target in target_users:
            profile = getattr(target, 'profile', None)
            photo = target.photos.filter(is_primary=True).first() or target.photos.first()
            
            results.append({
                "user_id": target.id,
                "name": profile.first_name if profile else "User",
                "age": profile.age if profile else None,
                "photo": photo.image.url if photo else None,
            })
            
        return response.Response(results)

class SwipeView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        target_id = request.data.get('target_id')
        action = request.data.get('action') # 'like' or 'dislike'
        
        if not target_id or action not in ['like', 'dislike']:
            return response.Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        # Check swipe limits
        from django.utils import timezone
        if user.last_swipe_date < timezone.now().date():
            user.swipes_today = 0
            user.last_swipe_date = timezone.now().date()
            user.save()

        if user.swipes_today >= user.daily_swipe_limit:
             return response.Response({"error": f"Daily swipe limit reached. Upgrade for more."}, status=status.HTTP_403_FORBIDDEN)

        target_user = User.objects.get(id=target_id)
        swipe, created = Swipe.objects.update_or_create(
            swiper=user, target=target_user,
            defaults={'action': action}
        )
        
        user.swipes_today += 1
        user.save()

        # Check for Match
        is_match = False
        if action == 'like':
            reverse_swipe = Swipe.objects.filter(swiper=target_user, target=user, action='like').exists()
            if reverse_swipe:
                match = Match.objects.create()
                match.users.add(user, target_user)
                is_match = True
                
                # Notify both users
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync
                channel_layer = get_channel_layer()
                
                # Notify Me (Swiper)
                async_to_sync(channel_layer.group_send)(
                    f"user_{user.id}",
                    {
                        "type": "match_notification",
                        "partner_id": target_user.id,
                        "partner_name": getattr(target_user, 'profile', user).first_name if hasattr(target_user, 'profile') else "Someone"
                    }
                )
                
                # Notify Limit (Target)
                async_to_sync(channel_layer.group_send)(
                    f"user_{target_user.id}",
                    {
                        "type": "match_notification",
                        "partner_id": user.id,
                        "partner_name": getattr(user, 'profile', user).first_name if hasattr(user, 'profile') else "Someone"
                    }
                )
        
        return response.Response({
            "status": "success",
            "is_match": is_match
        })

class UndoSwipeView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        from django.utils import timezone
        
        # Reset back swipe counter if new day
        if user.last_back_swipe_date < timezone.now().date():
            user.back_swipes_today = 0
            user.last_back_swipe_date = timezone.now().date()
            user.save()
            
        BACK_LIMITS = {'normal': 6, 'gold': 60, 'platinum': 1000000}
        limit = BACK_LIMITS.get(user.tier, 6)
        
        if user.back_swipes_today >= limit:
            return response.Response({"error": "Daily back swipe limit reached."}, status=status.HTTP_403_FORBIDDEN)
            
        # Get last swipe
        last_swipe = Swipe.objects.filter(swiper=user).order_by('-timestamp').first()
        if not last_swipe:
            return response.Response({"error": "No swipes to undo"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Handle Match Reversal
        if last_swipe.action == 'like':
             # Check if match exists
             # We need to filter match that contains both users
             matches = Match.objects.filter(users=user).filter(users=last_swipe.target)
             if matches.exists():
                 matches.first().delete()
        
        last_swipe.delete()
        
        # Update counters
        if user.swipes_today > 0:
            user.swipes_today -= 1
            
        user.back_swipes_today += 1
        user.save()
        
        return response.Response({"status": "undone", "remaining_back_swipes": limit - user.back_swipes_today})
