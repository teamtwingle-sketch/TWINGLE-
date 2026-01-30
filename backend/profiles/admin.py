
from django.contrib import admin
from .models import Profile, Interest, UserPhoto

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'first_name', 'gender', 'district', 'age')
    search_fields = ('first_name', 'user__email')

admin.site.register(Interest)
admin.site.register(UserPhoto)
