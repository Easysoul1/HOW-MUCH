from django.contrib import admin
from .models import ApiKey, ApiUsageLog


@admin.register(ApiKey)
class ApiKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'plan', 'daily_limit', 'is_active', 'last_used_at', 'created_at')
    list_filter = ('is_active', 'plan')
    search_fields = ('name', 'owner__email')
    readonly_fields = ('key', 'created_at', 'last_used_at')


@admin.register(ApiUsageLog)
class ApiUsageLogAdmin(admin.ModelAdmin):
    list_display = ('api_key', 'method', 'endpoint', 'status_code', 'response_time_ms', 'timestamp')
    list_filter = ('method', 'status_code')
    readonly_fields = ('api_key', 'endpoint', 'method', 'status_code', 'response_time_ms', 'ip_address', 'timestamp')
