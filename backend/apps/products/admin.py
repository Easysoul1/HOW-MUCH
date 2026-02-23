from django.contrib import admin
from .models import Category, UnitOfMeasurement, ProductSize, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'is_active', 'created_at')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(UnitOfMeasurement)
class UnitOfMeasurementAdmin(admin.ModelAdmin):
    list_display = ('name', 'abbreviation')
    search_fields = ('name', 'abbreviation')


@admin.register(ProductSize)
class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'value', 'unit')
    list_filter = ('unit',)
    search_fields = ('label',)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'status', 'is_active', 'is_featured', 'created_at')
    list_filter = ('is_active', 'is_featured', 'status', 'category', 'created_at')
    search_fields = ('name', 'sku', 'description')
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ('available_sizes',)
    inlines = [ProductImageInline]
    readonly_fields = ('sku', 'slug', 'reviewed_at')

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'sku', 'description', 'category')
        }),
        ('Sizes & Images', {
            'fields': ('available_sizes', 'image')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured', 'status', 'rejection_reason')
        }),
        ('Review', {
            'fields': ('suggested_by', 'reviewed_by', 'reviewed_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('product__name', 'alt_text')
