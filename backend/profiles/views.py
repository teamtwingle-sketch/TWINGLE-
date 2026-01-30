
from rest_framework import generics, permissions, viewsets
from .models import Profile, Interest, UserPhoto
from .serializers import ProfileSerializer, InterestSerializer, UserPhotoSerializer
from datetime import date

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile

    def perform_update(self, serializer):
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
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = 'user_id'

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
