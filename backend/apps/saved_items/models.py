from django.db import models
from django.conf import settings


class SavedItem(models.Model):
    """User's saved/favorited listing for quick access later."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_items'
    )
    listing = models.ForeignKey(
        'pricing.VendorListing',
        on_delete=models.CASCADE,
        related_name='saved_by'
    )
    saved_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, help_text="User's personal notes about this item")

    class Meta:
        unique_together = [['user', 'listing']]
        ordering = ['-saved_at']
        verbose_name = 'Saved Item'
        verbose_name_plural = 'Saved Items'

    def __str__(self):
        return f"{self.user.email} saved {self.listing}"
