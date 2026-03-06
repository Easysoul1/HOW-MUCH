from django.db import models
from django.conf import settings


class Notification(models.Model):
    """In-app notifications for users"""
    
    TYPE_CHOICES = [
        # Admin notifications
        ('CROWDSOURCE_SUBMISSION', 'New Crowdsourced Submission'),
        ('VENDOR_LISTING', 'New Vendor Listing'),
        ('PRODUCT_SUGGESTION', 'New Product Suggestion'),
        ('SIZE_REQUEST', 'New Size Request'),
        
        # Vendor notifications
        ('PRODUCT_APPROVED', 'Product Approved'),
        ('PRODUCT_REJECTED', 'Product Rejected'),
        ('SIZE_APPROVED', 'Size Request Approved'),
        ('SIZE_REJECTED', 'Size Request Rejected'),
        ('PRICE_UPDATE_REMINDER', 'Price Update Reminder'),
        
        # Crowdsourcer notifications
        ('SUBMISSION_REVIEWED', 'Submission Reviewed'),
        ('ITEM_APPROVED', 'Item Approved'),
        ('ITEM_REJECTED', 'Item Rejected'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=500, blank=True, help_text="URL to relevant page")
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def mark_as_read(self):
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

