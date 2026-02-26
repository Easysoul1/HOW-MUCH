import uuid
from django.db import models
from django.utils.text import slugify
from django.conf import settings


class Category(models.Model):
    """
    Product categories with optional parent for subcategories.
    e.g. Grains > Rice, Grains > Beans / Vegetables > Tomatoes
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class UnitOfMeasurement(models.Model):
    """
    Standard units: kg, g, litre, piece, tuber, bunch, etc.
    """
    name = models.CharField(max_length=50, unique=True)
    abbreviation = models.CharField(max_length=10)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.abbreviation})"


class ProductSize(models.Model):
    """
    Standard sizes per unit.
    e.g. 5kg, 10kg, 25kg, 50kg / 1 tuber / 1 bunch
    """
    value = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.ForeignKey(UnitOfMeasurement, on_delete=models.CASCADE, related_name='sizes')
    label = models.CharField(max_length=100, blank=True, help_text="Auto-generated if left blank e.g. '5kg'")

    class Meta:
        ordering = ['unit', 'value']
        unique_together = ['value', 'unit']

    def save(self, *args, **kwargs):
        if not self.label:
            val = float(self.value)
            formatted = str(int(val)) if val == int(val) else str(val)
            self.label = f"{formatted}{self.unit.abbreviation}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.label


class Product(models.Model):
    """
    Global product catalog. Admin-managed, vendor-suggested.
    Vendors list their prices against these products — they don't create products directly.
    """

    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    sku = models.CharField(max_length=50, unique=True, blank=True, help_text="Auto-generated if left blank")
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    available_sizes = models.ManyToManyField(ProductSize, related_name='products', blank=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    # Vendor suggestion flow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='APPROVED')
    suggested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='suggested_products',
        help_text="Null if added directly by admin"
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_products'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['status']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        if not self.sku:
            self.sku = f"HM-{uuid.uuid4().hex[:8].upper()}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.sku})"


class ProductImage(models.Model):
    """
    Additional images for a product. Primary image lives on Product itself.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'created_at']

    def __str__(self):
        return f"{self.product.name} - Image"


class SizeRequest(models.Model):
    """
    A vendor's request to add a new size to a product.
    Admin reviews and approves (which creates the ProductSize and links it).
    """
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='size_requests'
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='size_requests',
    )
    value = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.ForeignKey(
        UnitOfMeasurement, on_delete=models.CASCADE, related_name='size_requests'
    )
    note = models.TextField(blank=True, help_text="Optional reason for the suggestion")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_size_requests',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['product', 'value', 'unit', 'requested_by']

    def __str__(self):
        val = float(self.value)
        formatted = str(int(val)) if val == int(val) else str(val)
        return f"{formatted}{self.unit.abbreviation} for {self.product.name} (by {self.requested_by.email})"
