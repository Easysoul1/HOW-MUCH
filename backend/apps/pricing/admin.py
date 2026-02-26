from django.contrib import admin
from .models import VendorListing, PriceHistory


@admin.register(VendorListing)
class VendorListingAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'product', 'size', 'brand', 'price', 'is_available', 'updated_at')
    list_filter = ('is_available', 'product__category')
    search_fields = ('vendor__email', 'product__name', 'brand')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('listing', 'price', 'recorded_at')
    readonly_fields = ('listing', 'price', 'recorded_at')

