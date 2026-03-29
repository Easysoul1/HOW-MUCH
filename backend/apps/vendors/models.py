from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField


class VendorVerification(models.Model):
    """Vendor verification/KYC request for admin review."""
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vendor_verification',
        limit_choices_to={'user_type': 'VENDOR'}
    )
    
    # Business Information
    business_name = models.CharField(max_length=255)
    nin = models.CharField(max_length=20, verbose_name="National Identification Number")
    
    # Store Address
    store_address = models.TextField()
    store_city = models.CharField(max_length=100)
    store_state = models.CharField(max_length=100)
    store_landmark = models.CharField(max_length=255, blank=True, help_text="Nearby landmark for easier location")
    
    # Store Images (Cloudinary)
    store_image_1 = CloudinaryField('image', blank=True, null=True, help_text="Front view of store")
    store_image_2 = CloudinaryField('image', blank=True, null=True, help_text="Inside view of store")
    store_image_3 = CloudinaryField('image', blank=True, null=True, help_text="Products on display")
    
    # Additional Info
    years_in_business = models.PositiveIntegerField(default=0, help_text="Years operating this business")
    products_sold = models.TextField(blank=True, help_text="Main products sold (comma separated)")
    
    # Verification Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    rejection_reason = models.TextField(blank=True)
    
    # Admin Review
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_vendors'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Vendor Verification'
        verbose_name_plural = 'Vendor Verifications'
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.business_name} ({self.user.email}) - {self.status}"
    
    def approve(self, admin_user):
        """Approve verification and update user's is_verified flag."""
        from django.utils import timezone
        self.status = 'APPROVED'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.rejection_reason = ''
        self.save()
        
        # Update user's verification status
        self.user.is_verified = True
        self.user.save(update_fields=['is_verified'])
    
    def reject(self, admin_user, reason):
        """Reject verification with reason."""
        from django.utils import timezone
        self.status = 'REJECTED'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.rejection_reason = reason
        self.save()
        
        # Ensure user is marked as unverified
        self.user.is_verified = False
        self.user.save(update_fields=['is_verified'])
