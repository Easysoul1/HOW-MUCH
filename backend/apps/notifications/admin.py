from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'type', 'created_at')
    search_fields = ('user__email', 'user__username', 'title', 'message')
    readonly_fields = ('created_at', 'read_at')
    
    fieldsets = (
        ('Notification Info', {
            'fields': ('user', 'type', 'title', 'message', 'link')
        }),
        ('Status', {
            'fields': ('is_read', 'created_at', 'read_at')
        }),
    )

