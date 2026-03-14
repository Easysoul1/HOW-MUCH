from django.utils import timezone
from rest_framework import authentication, exceptions
from .models import ApiKey


class ApiKeyAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication using X-API-Key header.
    3rd party integrators use this to access the public API.
    """
    
    def authenticate(self, request):
        api_key = request.META.get('HTTP_X_API_KEY')
        if not api_key:
            return None  # Let other auth backends handle it
        
        try:
            key_obj = ApiKey.objects.select_related('owner').get(key=api_key)
        except ApiKey.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid API key.')
        
        if not key_obj.is_active:
            raise exceptions.AuthenticationFailed('API key has been deactivated.')
        
        if key_obj.expires_at and key_obj.expires_at < timezone.now():
            raise exceptions.AuthenticationFailed('API key has expired.')
        
        # Update last_used_at (fire and forget, don't slow down the request)
        ApiKey.objects.filter(pk=key_obj.pk).update(last_used_at=timezone.now())
        
        return (key_obj.owner, key_obj)
    
    def authenticate_header(self, request):
        return 'X-API-Key'
