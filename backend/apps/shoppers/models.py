from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import uuid


class ShopperProfile(models.Model):
    """
    Extended profile for personal shoppers.
    Links to a User with user_type='SHOPPER'.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shopper_profile'
    )
    
    # Application info
    bio = models.TextField(blank=True, help_text="Brief description about the shopper")
    experience = models.TextField(blank=True, help_text="Relevant experience")
    
    # Verification
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    id_document = models.ImageField(upload_to='shopper_docs/', blank=True, null=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='shoppers_verified'
    )
    rejection_reason = models.TextField(blank=True)
    
    # Service area
    service_radius_km = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    
    # Stats (cached for performance)
    total_completed_orders = models.PositiveIntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_ratings = models.PositiveIntegerField(default=0)
    
    # Availability
    is_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Shopper: {self.user.get_full_name() or self.user.email}"

    def approve(self, admin_user):
        self.status = 'approved'
        self.verified_at = timezone.now()
        self.verified_by = admin_user
        self.user.is_verified = True
        self.user.save()
        self.save()

    def reject(self, admin_user, reason=''):
        self.status = 'rejected'
        self.verified_by = admin_user
        self.rejection_reason = reason
        self.save()


class ShopperRequest(models.Model):
    """
    A request from a customer to a personal shopper.
    Goes into a pool where any approved shopper can pick it up.
    """
    STATUS_CHOICES = [
        ('open', 'Open'),                    # Waiting for a shopper
        ('accepted', 'Accepted'),            # Shopper accepted
        ('offer_made', 'Offer Made'),        # Shopper made an offer
        ('confirmed', 'Confirmed'),          # Customer confirmed offer
        ('in_progress', 'In Progress'),      # Shopping in progress
        ('completed', 'Completed'),          # Delivered
        ('cancelled', 'Cancelled'),          # Cancelled
        ('expired', 'Expired'),              # No shopper picked up
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Customer
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shopper_requests'
    )
    
    # Assigned shopper (null until accepted)
    shopper = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='accepted_shopper_requests'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # Customer's notes/instructions
    customer_notes = models.TextField(blank=True)
    
    # Delivery info
    delivery_address = models.TextField(blank=True)
    delivery_city = models.CharField(max_length=100, blank=True)
    delivery_state = models.CharField(max_length=100, blank=True)
    delivery_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    delivery_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Expiry (48 hours for shoppers to pick up)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"ShopperRequest {self.id} - {self.customer.email}"

    def save(self, *args, **kwargs):
        if not self.expires_at and self.status == 'open':
            self.expires_at = timezone.now() + timezone.timedelta(hours=48)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        if self.expires_at and self.status == 'open':
            return timezone.now() > self.expires_at
        return False

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def unique_vendors(self):
        return self.items.values('vendor_name').distinct().count()

    def calculate_service_fee(self):
        """
        Calculate platform service fee:
        - ₦50 per item + ₦100 per vendor
        - Capped at 5% of total goods
        - Minimum ₦500
        """
        items_total = sum(
            item.listed_price * item.quantity 
            for item in self.items.all()
        )
        
        item_count = self.total_items
        vendor_count = self.unique_vendors
        
        # Base fee calculation
        base_fee = (item_count * 50) + (vendor_count * 100)
        
        # Cap at 5% of total goods
        cap = items_total * Decimal('0.05')
        fee = min(base_fee, cap)
        
        # Minimum ₦500
        return max(fee, Decimal('500'))


class ShopperRequestItem(models.Model):
    """
    An item in a shopper request - captured from customer's cart.
    """
    request = models.ForeignKey(
        ShopperRequest,
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    # Listing reference (optional - may be deleted later)
    listing = models.ForeignKey(
        'pricing.VendorListing',
        on_delete=models.SET_NULL,
        null=True, blank=True
    )
    
    # Captured details at request time
    product_name = models.CharField(max_length=255)
    product_image = models.URLField(blank=True)
    size_label = models.CharField(max_length=100)
    brand = models.CharField(max_length=100, blank=True)
    vendor_name = models.CharField(max_length=255)
    listed_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"


class ShopperOffer(models.Model):
    """
    An offer made by a shopper to the customer.
    Similar to VendorOffer but from a shopper.
    """
    request = models.ForeignKey(
        ShopperRequest,
        on_delete=models.CASCADE,
        related_name='offers'
    )
    
    # Items subtotal (sum of offered prices * quantities)
    items_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Fees
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Platform fee
    
    # Total = items_total + delivery_fee + service_fee
    
    # Estimated delivery
    estimated_delivery = models.CharField(max_length=255, blank=True)
    message = models.TextField(blank=True, help_text="Message to customer")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Offer for {self.request_id}"

    @property
    def grand_total(self):
        return self.items_total + self.delivery_fee + self.service_fee

    def save(self, *args, **kwargs):
        # Calculate service fee if not set
        if self.service_fee == 0:
            self.service_fee = self.request.calculate_service_fee()
        super().save(*args, **kwargs)


class ShopperOfferItem(models.Model):
    """
    Individual item pricing in a shopper's offer.
    """
    offer = models.ForeignKey(
        ShopperOffer,
        on_delete=models.CASCADE,
        related_name='offer_items'
    )
    
    request_item = models.ForeignKey(
        ShopperRequestItem,
        on_delete=models.CASCADE,
        related_name='offer_items'
    )
    
    # Price the shopper found/negotiated
    offered_price = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True, help_text="e.g., found cheaper alternative")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.request_item.product_name} @ ₦{self.offered_price}"


class ShopperRating(models.Model):
    """
    Customer rating for a completed shopper request.
    """
    request = models.OneToOneField(
        ShopperRequest,
        on_delete=models.CASCADE,
        related_name='rating'
    )
    
    shopper = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shopper_ratings_received'
    )
    
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shopper_ratings_given'
    )
    
    rating = models.PositiveSmallIntegerField(help_text="1-5 stars")
    comment = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating}★ for {self.shopper.email}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update shopper's average rating
        profile = self.shopper.shopper_profile
        ratings = ShopperRating.objects.filter(shopper=self.shopper)
        profile.total_ratings = ratings.count()
        profile.average_rating = ratings.aggregate(
            avg=models.Avg('rating')
        )['avg'] or 0
        profile.save()

