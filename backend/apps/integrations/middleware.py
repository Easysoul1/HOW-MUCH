import time
from .models import ApiKey, ApiUsageLog


class ApiUsageLoggingMiddleware:
    """
    Middleware that logs API requests made with an API key.
    Only logs requests under /api/v1/ to avoid noise.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if not request.path.startswith('/api/v1/'):
            return self.get_response(request)
        
        start_time = time.time()
        response = self.get_response(request)
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Log if request was authenticated with an API key
        api_key = getattr(request, 'auth', None)
        if isinstance(api_key, ApiKey):
            try:
                ApiUsageLog.objects.create(
                    api_key=api_key,
                    endpoint=request.path,
                    method=request.method,
                    status_code=response.status_code,
                    response_time_ms=response_time_ms,
                    ip_address=self._get_client_ip(request),
                )
            except Exception:
                pass  # Don't let logging errors break API responses
        
        # Add rate limit headers
        if isinstance(api_key, ApiKey):
            from django.utils import timezone
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            used = ApiUsageLog.objects.filter(
                api_key=api_key, timestamp__gte=today_start
            ).count()
            response['X-RateLimit-Limit'] = str(api_key.daily_limit)
            response['X-RateLimit-Remaining'] = str(max(0, api_key.daily_limit - used))
        
        return response
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
