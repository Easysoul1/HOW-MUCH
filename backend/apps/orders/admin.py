from django.contrib import admin
from .models import PurchaseRequest, RequestItem, VendorOffer, OfferItem


class RequestItemInline(admin.TabularInline):
    model = RequestItem
    extra = 0
    readonly_fields = ['listing', 'product_name', 'size_label', 'brand', 'listed_price', 'quantity']


class OfferItemInline(admin.TabularInline):
    model = OfferItem
    extra = 0


class VendorOfferInline(admin.TabularInline):
    model = VendorOffer
    extra = 0
    readonly_fields = ['delivery_fee', 'service_fee', 'discount', 'created_at']
    show_change_link = True


@admin.register(PurchaseRequest)
class PurchaseRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'buyer', 'vendor', 'status', 'total_items', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['buyer__email', 'vendor__email']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [RequestItemInline, VendorOfferInline]


@admin.register(VendorOffer)
class VendorOfferAdmin(admin.ModelAdmin):
    list_display = ['id', 'request', 'delivery_fee', 'discount', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    readonly_fields = ['created_at']
    inlines = [OfferItemInline]

