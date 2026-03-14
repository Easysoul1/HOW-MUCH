import secrets
from django.db import models
from django.conf import settings


class ApiKey(models.Model):
    """API key for 3rd party integrators to access the public API."""
    
    PLAN_CHOICES = [
        ('BASIC', 'Basic'),
        ('PRO', 'Pro'),
        ('ENTERPRISE', 'Enterprise'),
    ]
    
    key = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=100, help_text="Label for this key e.g. 'Production', 'Staging'")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='api_keys'
    )
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='BASIC')
    daily_limit = models.PositiveIntegerField(default=10000, help_text="Max requests per day")
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.owner.email}) - {self.masked_key}"
    
    @property
    def masked_key(self):
        """Show only last 8 chars: hm_live_••••••••abcd1234"""
        if len(self.key) > 8:
            return f"{'•' * (len(self.key) - 8)}{self.key[-8:]}"
        return self.key
    
    @classmethod
    def generate_key(cls):
        """Generate a prefixed API key: hm_live_<random>"""
        return f"hm_live_{secrets.token_hex(24)}"
    
    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        super().save(*args, **kwargs)


class ApiUsageLog(models.Model):
    """Tracks each API request for analytics and rate limiting."""
    
    api_key = models.ForeignKey(
        ApiKey,
        on_delete=models.CASCADE,
        related_name='usage_logs'
    )
    endpoint = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    status_code = models.PositiveIntegerField()
    response_time_ms = models.PositiveIntegerField(default=0)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['api_key', 'timestamp']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.method} {self.endpoint} [{self.status_code}] - {self.api_key.name}"
