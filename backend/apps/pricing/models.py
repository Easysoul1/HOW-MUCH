from django.db import models
from django.conf import settings


class VendorListing(models.Model):
    """
    A vendor's price listing for a specific product + size + brand combination.
    Vendors can list the same product/size multiple times under different brands.
    e.g. Gino Tomato Paste 70g @ ₦500, Sonia Tomato Paste 70g @ ₦450
    """
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='listings',
        limit_choices_to={'user_type': 'VENDOR'},
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='listings',
        limit_choices_to={'status': 'APPROVED', 'is_active': True},
    )
    size = models.ForeignKey(
        'products.ProductSize',
        on_delete=models.CASCADE,
        related_name='listings',
    )
    brand = models.CharField(
        max_length=150,
        blank=True,
        help_text="Brand or variety name e.g. 'Gino', 'Sonia', 'Mama Gold'. Leave blank if generic."
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    is_available = models.BooleanField(default=True, help_text="Is this item currently in stock?")
    notes = models.TextField(blank=True, help_text="Optional extra info e.g. 'Wholesale only', 'Imported'")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        brand_str = f" ({self.brand})" if self.brand else ""
        return f"{self.vendor.email} — {self.product.name}{brand_str} {self.size.label} @ ₦{self.price}"

    def save(self, *args, **kwargs):
        if self.pk:
            try:
                old = VendorListing.objects.get(pk=self.pk)
                if old.price != self.price:
                    # Record the previous price before overwriting it
                    PriceHistory.objects.create(listing=self, price=old.price)
            except VendorListing.DoesNotExist:
                pass
        super().save(*args, **kwargs)


class PriceHistory(models.Model):
    """
    Immutable record of a previous price for a listing.
    Created automatically whenever a vendor updates the price of a listing.
    """
    listing = models.ForeignKey(
        VendorListing,
        on_delete=models.CASCADE,
        related_name='price_history',
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"{self.listing} — ₦{self.price} at {self.recorded_at:%Y-%m-%d %H:%M}"

