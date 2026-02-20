from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """
    Product categories (Rice, Beans, Yam, Tomatoes, etc.)
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
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class UnitOfMeasurement(models.Model):
    """
    Standard units (kg, g, litre, pieces, tubers, etc.)
    """
    name = models.CharField(max_length=50, unique=True)
    abbreviation = models.CharField(max_length=10)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.abbreviation})"


class ProductSize(models.Model):
    """
    Standard sizes/weights (5kg, 10kg, 25kg, 50kg, 1 tuber, etc.)
    """
    name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.ForeignKey(UnitOfMeasurement, on_delete=models.CASCADE)
    
    class Meta:
        ordering = ['value']
        unique_together = ['value', 'unit']
    
    def __str__(self):
        return f"{self.value}{self.unit.abbreviation}"


class Product(models.Model):
    """
    Grocery products with SKU codes
    """
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    sku = models.CharField(max_length=50, unique=True, help_text="Stock Keeping Unit code")
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    
    # Standard sizes available for this product
    available_sizes = models.ManyToManyField(ProductSize, related_name='products')
    
    # Images
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    
    # Meta information
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
        ]
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} ({self.sku})"


class ProductImage(models.Model):
    """
    Additional images for products
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
