from django.contrib import admin
from django.utils import timezone
from .models import (
    ShopperProfile, ShopperRequest, ShopperRequestItem,
    ShopperOffer, ShopperOfferItem, ShopperRating
)


@admin.register(ShopperProfile)
class ShopperProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'total_completed_orders', 'average_rating', 'is_available', 'created_at']
    list_filter = ['status', 'is_available', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['total_completed_orders', 'total_earnings', 'average_rating', 'total_ratings', 'created_at', 'verified_at']
    
    actions = ['approve_shoppers', 'reject_shoppers', 'suspend_shoppers']
    
    def approve_shoppers(self, request, queryset):
        for profile in queryset.filter(status='pending'):
            profile.approve(request.user)
        self.message_user(request, f"Approved {queryset.count()} shopper(s).")
    approve_shoppers.short_description = "Approve selected shoppers"
    
    def reject_shoppers(self, request, queryset):
        for profile in queryset.filter(status='pending'):
            profile.reject(request.user, reason='Application rejected by admin')
        self.message_user(request, f"Rejected {queryset.count()} shopper(s).")
    reject_shoppers.short_description = "Reject selected shoppers"
    
    def suspend_shoppers(self, request, queryset):
        queryset.update(status='suspended')
        self.message_user(request, f"Suspended {queryset.count()} shopper(s).")
    suspend_shoppers.short_description = "Suspend selected shoppers"


@admin.register(ShopperRequestItem)
class ShopperRequestItemAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'vendor_name', 'listed_price', 'quantity', 'request']
    list_filter = ['created_at']
    search_fields = ['product_name', 'vendor_name']


@admin.register(ShopperOffer)
class ShopperOfferAdmin(admin.ModelAdmin):
    list_display = ['request', 'items_total', 'delivery_fee', 'service_fee', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']


@admin.register(ShopperRequest)
class ShopperRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'shopper', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['customer__email', 'shopper__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'accepted_at', 'completed_at', 'expires_at']


@admin.register(ShopperRating)
class ShopperRatingAdmin(admin.ModelAdmin):
    list_display = ['shopper', 'customer', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['shopper__email', 'customer__email']
    readonly_fields = ['created_at']

