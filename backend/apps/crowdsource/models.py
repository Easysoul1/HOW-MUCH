from django.db import models
from django.conf import settings
from apps.products.models import Product

class MarketPrice(models.Model):
    """
    Prices sourced by CrowdSourcers directly from markets.
    Requires admin approval before becoming visible to buyers.
    """
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='market_prices')
    crowdsourcer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='submitted_prices'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    market_name = models.CharField(max_length=255, help_text="Name of the market or store")
    proof_image_1 = models.ImageField(upload_to='market_prices/proofs/', null=True, blank=False, help_text="Required: 1st angle")
    proof_image_2 = models.ImageField(upload_to='market_prices/proofs/', null=True, blank=False, help_text="Required: 2nd angle")
    proof_image_3 = models.ImageField(upload_to='market_prices/proofs/', null=True, blank=False, help_text="Required: 3rd angle")
    proof_image_4 = models.ImageField(upload_to='market_prices/proofs/', null=True, blank=False, help_text="Required: 4th angle")
    proof_image_5 = models.ImageField(upload_to='market_prices/proofs/', null=True, blank=True, help_text="Optional: 5th angle")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True, help_text="Additional context like 'price varies by size'")
    
    # Admin review tracking
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_market_prices'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['market_name']),
        ]

    def __str__(self):
        return f"{self.product.name} - ₦{self.price} at {self.market_name}"
