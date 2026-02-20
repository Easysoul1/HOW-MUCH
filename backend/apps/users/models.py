from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom user model supporting multiple user types:
    - CUSTOMER: Regular users searching for prices
    - VENDOR: Sellers listing products
    - SHOPPER: Personal shoppers providing services
    - CROWDSOURCER: Volunteers submitting price surveys
    - INTEGRATOR: Third-party API consumers
    """
    
    USER_TYPE_CHOICES = (
        ('CUSTOMER', 'Customer'),
        ('VENDOR', 'Vendor'),
        ('SHOPPER', 'Personal Shopper'),
        ('CROWDSOURCER', 'Crowdsourcer'),
        ('INTEGRATOR', 'Integrator'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='CUSTOMER')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    class Meta:
        ordering = ['-created_at']

