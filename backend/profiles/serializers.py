
from rest_framework import serializers
from .models import Profile, Interest, UserPhoto

class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = '__all__'

class UserPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPhoto
        fields = ('id', 'image', 'is_primary', 'is_approved')
        read_only_fields = ('is_approved',)

class ProfileSerializer(serializers.ModelSerializer):
    interests = InterestSerializer(many=True, read_only=True)
    interest_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    photos = UserPhotoSerializer(many=True, read_only=True, source='user.photos')
    is_premium = serializers.BooleanField(source='user.is_premium', read_only=True)
    premium_expiry = serializers.DateTimeField(source='user.premium_expiry', read_only=True)

    def validate_dob(self, value):
        from datetime import date
        today = date.today()
        # Calculate age
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
             raise serializers.ValidationError("You must be at least 18 years old.")
        return value

    class Meta:
        model = Profile
        fields = (
            'id', 'first_name', 'dob', 'age', 'gender', 'interested_in',
            'district', 'height_cm', 'relationship_intents', 'bio',
            'interests', 'interest_ids', 'photos', 'is_premium', 'premium_expiry'
        )
        read_only_fields = ('age',)

    def create(self, validated_data):
        interest_ids = validated_data.pop('interest_ids', [])
        profile = Profile.objects.create(**validated_data)
        if interest_ids:
            profile.interests.set(interest_ids)
        return profile

    def update(self, instance, validated_data):
        interest_ids = validated_data.pop('interest_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if interest_ids is not None:
            instance.interests.set(interest_ids)
        return instance
