from django.utils import timezone
from rest_framework.throttling import BaseThrottle
from .models import ApiKey, ApiUsageLog


class ApiKeyDailyThrottle(BaseThrottle):
    """
    Throttle based on daily request count per API key.
    Each ApiKey has its own daily_limit.
    """
    
    def allow_request(self, request, view):
        # Only applies to ApiKey-authenticated requests
        if not isinstance(request.auth, ApiKey):
            return True
        
        api_key = request.auth
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        request_count = ApiUsageLog.objects.filter(
            api_key=api_key,
            timestamp__gte=today_start
        ).count()
        
        if request_count >= api_key.daily_limit:
            self.wait_seconds = self._seconds_until_midnight()
            return False
        
        return True
    
    def wait(self):
        return getattr(self, 'wait_seconds', None)
    
    def _seconds_until_midnight(self):
        now = timezone.now()
        midnight = (now + timezone.timedelta(days=1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        return int((midnight - now).total_seconds())
