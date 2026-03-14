from django.contrib import admin
from .models import CrowdsourcedSubmission, CrowdsourcedItem


class CrowdsourcedItemInline(admin.TabularInline):
    model = CrowdsourcedItem
    extra = 0
    readonly_fields = ('created_at', 'approved_at', 'approved_by')
    fields = ('product', 'product_name', 'size', 'size_value', 'size_unit', 'price', 'brand', 'status', 'rejection_reason')


@admin.register(CrowdsourcedSubmission)
class CrowdsourcedSubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'crowdsourcer', 'city', 'state', 'item_count', 'approved_item_count', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'state')
    search_fields = ('crowdsourcer__email', 'crowdsourcer__username', 'city', 'state')
    readonly_fields = ('created_at', 'updated_at', 'reviewed_at', 'reviewed_by', 'item_count', 'approved_item_count')
    inlines = [CrowdsourcedItemInline]
    
    fieldsets = (
        ('Submission Info', {
            'fields': ('crowdsourcer', 'status', 'admin_notes')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'address', 'city', 'state')
        }),
        ('Store Photos', {
            'fields': ('photo_1', 'photo_2', 'photo_3')
        }),
        ('Review Info', {
            'fields': ('reviewed_by', 'reviewed_at', 'item_count', 'approved_item_count', 'created_at', 'updated_at')
        }),
    )


@admin.register(CrowdsourcedItem)
class CrowdsourcedItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'submission', 'get_product_display', 'get_size_display', 'price', 'brand', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('product__name', 'product_name', 'brand')
    readonly_fields = ('created_at', 'approved_at', 'approved_by')
    
    def get_product_display(self, obj):
        return obj.product.name if obj.product else obj.product_name
    get_product_display.short_description = 'Product'
    
    def get_size_display(self, obj):
        if obj.size:
            return obj.size.label
        elif obj.size_value and obj.size_unit:
            return f"{obj.size_value}{obj.size_unit.abbreviation}"
        return "N/A"
    get_size_display.short_description = 'Size'
