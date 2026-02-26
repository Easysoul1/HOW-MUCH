from django.contrib import admin
from .models import MarketPrice

@admin.register(MarketPrice)
class MarketPriceAdmin(admin.ModelAdmin):
    list_display = ('product', 'crowdsourcer', 'price', 'market_name', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('product__name', 'crowdsourcer__username', 'market_name')
    readonly_fields = ('created_at', 'updated_at', 'reviewed_by', 'reviewed_at')
    
    actions = ['approve_prices', 'reject_prices']

    def approve_prices(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='APPROVED', reviewed_by=request.user, reviewed_at=timezone.now())
    approve_prices.short_description = "Approve selected market prices"

    def reject_prices(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='REJECTED', reviewed_by=request.user, reviewed_at=timezone.now())
    reject_prices.short_description = "Reject selected market prices"
