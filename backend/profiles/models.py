
from datetime import date
from django.db import models
from django.conf import settings

class Interest(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class Profile(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )
    
    INTERESTED_IN_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('all', 'All'),
    )
    
    DISTRICT_CHOICES = (
        ('alappuzha', 'Alappuzha'),
        ('ernakulam', 'Ernakulam'),
        ('idukki', 'Idukki'),
        ('kannur', 'Kannur'),
        ('kasaragod', 'Kasaragod'),
        ('kollam', 'Kollam'),
        ('kottayam', 'Kottayam'),
        ('kozhikode', 'Kozhikode'),
        ('malappuram', 'Malappuram'),
        ('palakkad', 'Palakkad'),
        ('pathanamthitta', 'Pathanamthitta'),
        ('thiruvananthapuram', 'Thiruvananthapuram'),
        ('thrissur', 'Thrissur'),
        ('wayanad', 'Wayanad'),
    )
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=50, blank=True) 
    dob = models.DateField(null=True, blank=True) 
    age = models.IntegerField(editable=False, null=True) 
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    interested_in = models.CharField(max_length=10, choices=INTERESTED_IN_CHOICES, null=True, blank=True)
    
    district = models.CharField(max_length=20, choices=DISTRICT_CHOICES, default='ernakulam')
    height_cm = models.IntegerField(null=True, blank=True)
    
    # Intents (stored as comma-separated string or use a M2M if strict normalized)
    # Using JSONField to store multiple choices simply (requires a specific way to filter on SQLite, but works)
    # Actually, let's use a Simple M2M for RelationshipIntent
    
    bio = models.TextField(blank=True, max_length=500)
    
    interests = models.ManyToManyField(Interest, blank=True)
    
    # Store intents as a simple list for matching
    relationship_intents = models.JSONField(default=list) 
    # e.g. ["marriage", "serious_dating"]

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} ({self.user.email})"

    def save(self, *args, **kwargs):
        if self.dob:
            today = date.today()
            self.age = today.year - self.dob.year - ((today.month, today.day) < (self.dob.month, self.dob.day))
        super().save(*args, **kwargs)

class UserPhoto(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='profile_photos/')
    is_primary = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Photo for {self.user.email}"
