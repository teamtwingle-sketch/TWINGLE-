
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
        new_candidates = User.objects.exclude(id=user.id).exclude(id__in=swiped_ids).exclude(id__in=blocked_ids).exclude(id__in=blocked_by_ids).filter(status='active')

        # 2. Recycled Candidates (Swiped but not Matched/Blocked)
        old_candidates = User.objects.exclude(id=user.id).filter(id__in=swiped_ids).exclude(id__in=matched_ids).exclude(id__in=blocked_ids).exclude(id__in=blocked_by_ids).filter(status='active')

        # Filter by gender interest
        if profile.interested_in == 'male':
            new_candidates = new_candidates.filter(profile__gender='male')
            old_candidates = old_candidates.filter(profile__gender='male')
        elif profile.interested_in == 'female':
            new_candidates = new_candidates.filter(profile__gender='female')
            old_candidates = old_candidates.filter(profile__gender='female')

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
             c_interests = set(c_profile.interests.values_list('id', flat=True))
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

        scored_new = []
        for c in new_candidates.select_related('profile'):
            res = score_user(c)
            if res: scored_new.append(res)
        scored_new.sort(key=lambda x: x['score'], reverse=True)

        scored_old = []
        for c in old_candidates.select_related('profile'):
             res = score_user(c)
             if res: scored_old.append(res)
        random.shuffle(scored_old) # Randomize old users

        # Priority: New > Old
        final_results = scored_new + scored_old
        
        return response.Response(final_results[:10])

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
             return response.Response({"error": "Daily swipe limit reached."}, status=status.HTTP_403_FORBIDDEN)

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
        
        return response.Response({
            "status": "success",
            "is_match": is_match
        })
