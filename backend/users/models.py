
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField('email address', unique=True)
    
    # Status
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('under_review', 'Under Review'),
        ('temp_banned', 'Temporarily Banned'),
        ('perm_banned', 'Permanently Banned'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Premium features
    is_premium = models.BooleanField(default=False)
    premium_expiry = models.DateTimeField(null=True, blank=True)
    
    # Daily Swipe Limits
    swipes_today = models.IntegerField(default=0)
    daily_swipe_limit = models.IntegerField(default=8) # 8 for free, 60 for Gold, 10000 for Platinum
    last_swipe_date = models.DateField(auto_now_add=True)
    last_activity = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
