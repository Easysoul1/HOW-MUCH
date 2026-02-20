from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_verified', 'created_at')
    list_filter = ('user_type', 'is_verified', 'is_staff')
    search_fields = ('username', 'email', 'phone_number')
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': ('user_type', 'phone_number', 'address', 'city', 'state', 
                      'latitude', 'longitude', 'is_verified')
        }),
    )

