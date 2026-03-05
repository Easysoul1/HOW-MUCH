from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField


class CrowdsourcedSubmission(models.Model):
    """A batch submission of prices from a crowdsourcer"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('REVIEWED', 'Reviewed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    crowdsourcer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='crowdsourced_submissions'
    )
    
    # Location data
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    
    # Store verification photos (1-3 photos of crowdsourcer in store)
    photo_1 = CloudinaryField('image', blank=True, null=True)
    photo_2 = CloudinaryField('image', blank=True, null=True)
    photo_3 = CloudinaryField('image', blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_submissions'
    )
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Submission by {self.crowdsourcer.email} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def item_count(self):
        return self.items.count()
    
    @property
    def approved_item_count(self):
        return self.items.filter(status='APPROVED').count()


class CrowdsourcedItem(models.Model):
    """Individual price item within a submission"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    submission = models.ForeignKey(
        CrowdsourcedSubmission,
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    # Product reference - either existing product OR new product name
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='crowdsourced_items'
    )
    product_name = models.CharField(
        max_length=200,
        blank=True,
        help_text="For new products not yet in catalog"
    )
    
    # Size reference - either existing size OR new size value+unit
    size = models.ForeignKey(
        'products.ProductSize',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='crowdsourced_items'
    )
    size_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="For new sizes not yet in catalog"
    )
    size_unit = models.ForeignKey(
        'products.UnitOfMeasurement',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='crowdsourced_items'
    )
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    brand = models.CharField(max_length=100, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    rejection_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_crowdsourced_items'
    )
    
    class Meta:
        ordering = ['created_at']
        
    def __str__(self):
        product_display = self.product.name if self.product else self.product_name
        size_display = self.size.label if self.size else f"{self.size_value}{self.size_unit.abbreviation if self.size_unit else ''}"
        return f"{product_display} {size_display} - ₦{self.price}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Must have either product or product_name
        if not self.product and not self.product_name:
            raise ValidationError("Either product or product_name must be provided")
        
        # Must have either size or (size_value + size_unit)
        if not self.size and not (self.size_value and self.size_unit):
            raise ValidationError("Either size or (size_value + size_unit) must be provided")
