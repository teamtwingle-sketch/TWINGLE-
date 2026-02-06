
from rest_framework import generics, permissions, viewsets
from .models import Profile, Interest, UserPhoto
from .serializers import ProfileSerializer, InterestSerializer, UserPhotoSerializer, PublicProfileSerializer, BasicProfileSerializer
from datetime import date
from rest_framework import response

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile

    def perform_update(self, serializer):
        # Prevent users from updating verification status themselves
        if 'verification_status' in serializer.validated_data:
            serializer.validated_data.pop('verification_status')
        if 'is_verified' in serializer.validated_data:
            serializer.validated_data.pop('is_verified')
            
        # Calculate age or other logic
        dob = serializer.validated_data.get('dob')
        if dob:
            today = date.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            serializer.save(age=age)
        else:
            serializer.save()

class PublicProfileDetailView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = PublicProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = 'user_id'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        
        # Check tier
        is_premium_tier = user.tier in ['gold', 'platinum']
        
        # Check match
        target_user = instance.user
        from matches.models import Match
        is_matched = Match.objects.filter(users=user).filter(users=target_user).exists()
        
        if is_premium_tier and is_matched:
             serializer = PublicProfileSerializer(instance, context={'request': request})
        else:
             serializer = BasicProfileSerializer(instance, context={'request': request})
             
        return response.Response(serializer.data)

class InterestListView(generics.ListAPIView):
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer
    permission_classes = (permissions.IsAuthenticated,)

class UserPhotoViewSet(viewsets.ModelViewSet):
    serializer_class = UserPhotoSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return UserPhoto.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
