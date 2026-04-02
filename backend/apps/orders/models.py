from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class PurchaseRequest(models.Model):
    """
    A purchase request from a customer to a vendor.
    One request per vendor - if cart has items from multiple vendors,
    multiple PurchaseRequests are created.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('offer_made', 'Offer Made'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    FULFILLMENT_CHOICES = [
        ('none', 'Not Started'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    DELIVERY_METHOD_CHOICES = [
        ('delivery', 'Delivery'),
        ('pickup', 'Pickup'),
    ]

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='purchase_requests',
        limit_choices_to={'user_type': 'CUSTOMER'},
    )
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vendor_requests',
        limit_choices_to={'user_type': 'VENDOR'},
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    fulfillment_status = models.CharField(max_length=20, choices=FULFILLMENT_CHOICES, default='none')
    delivery_method = models.CharField(max_length=20, choices=DELIVERY_METHOD_CHOICES, default='delivery')
    
    buyer_notes = models.TextField(blank=True, help_text="Notes from customer when creating request")
    rejection_reason = models.TextField(blank=True, help_text="Reason if customer rejects offer")
    
    # Delivery address (captured at request time, only used if delivery_method='delivery')
    delivery_address = models.TextField(blank=True)
    delivery_city = models.CharField(max_length=100, blank=True)
    delivery_state = models.CharField(max_length=100, blank=True)
    delivery_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    delivery_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Request #{self.pk} - {self.buyer.email} → {self.vendor.email} ({self.status})"

    @property
    def is_expired(self):
        """Check if request should be expired (48h with no action)."""
        if self.status in ['accepted', 'rejected', 'expired']:
            return False
        return timezone.now() > self.updated_at + timedelta(hours=48)

    @property
    def expires_at(self):
        """When this request will expire if no action taken."""
        if self.status in ['accepted', 'rejected', 'expired']:
            return None
        return self.updated_at + timedelta(hours=48)

    @property
    def total_items(self):
        return self.items.count()


class RequestItem(models.Model):
    """
    An item within a purchase request.
    Links to the original listing but captures price at request time.
    """
    request = models.ForeignKey(
        PurchaseRequest,
        on_delete=models.CASCADE,
        related_name='items',
    )
    listing = models.ForeignKey(
        'pricing.VendorListing',
        on_delete=models.SET_NULL,
        null=True,
        related_name='request_items',
    )
    # Capture listing details at request time (in case listing changes/deleted)
    product_name = models.CharField(max_length=255)
    product_image = models.URLField(blank=True, null=True)
    size_label = models.CharField(max_length=100)
    brand = models.CharField(max_length=150, blank=True)
    listed_price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Price at time of request")
    
    quantity = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True, help_text="Buyer notes for this specific item")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.product_name} x{self.quantity} @ ₦{self.listed_price}"


class VendorOffer(models.Model):
    """
    A vendor's offer in response to a purchase request.
    Vendors can make multiple offers (revisions) for the same request.
    """
    request = models.ForeignKey(
        PurchaseRequest,
        on_delete=models.CASCADE,
        related_name='offers',
    )
    
    # Fees and discounts
    delivery_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    service_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Optional service/handling fee")
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Discount amount")
    
    # Delivery info
    estimated_delivery = models.CharField(max_length=255, blank=True, help_text="e.g. '2-3 hours', 'Same day', 'Tomorrow'")
    
    # Vendor message
    message = models.TextField(blank=True, help_text="Message from vendor to buyer")
    
    # Whether this is the active/latest offer
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Offer #{self.pk} for Request #{self.request_id}"

    @property
    def items_total(self):
        """Sum of all offered item prices × quantities."""
        return sum(
            item.offered_price * item.request_item.quantity 
            for item in self.offer_items.all()
        )

    @property
    def grand_total(self):
        """Total including delivery, service fee, minus discount."""
        return self.items_total + self.delivery_fee + self.service_fee - self.discount

    def save(self, *args, **kwargs):
        # Deactivate previous offers when a new one is created
        if not self.pk:
            VendorOffer.objects.filter(request=self.request, is_active=True).update(is_active=False)
        super().save(*args, **kwargs)


class OfferItem(models.Model):
    """
    Individual item pricing within a vendor offer.
    Allows vendor to adjust price from the original listing price.
    """
    offer = models.ForeignKey(
        VendorOffer,
        on_delete=models.CASCADE,
        related_name='offer_items',
    )
    request_item = models.ForeignKey(
        RequestItem,
        on_delete=models.CASCADE,
        related_name='offer_prices',
    )
    offered_price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Vendor's offered price per unit")
    notes = models.TextField(blank=True, help_text="Vendor notes for this item e.g. 'Out of stock, substituted'")

    class Meta:
        unique_together = ['offer', 'request_item']

    def __str__(self):
        return f"{self.request_item.product_name} @ ₦{self.offered_price}"

