from django.contrib import admin
from .models import VendorVerification


@admin.register(VendorVerification)
class VendorVerificationAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'user', 'status', 'store_city', 'submitted_at', 'reviewed_at')
    list_filter = ('status', 'store_state', 'submitted_at')
    search_fields = ('business_name', 'user__email', 'nin', 'store_city')
    readonly_fields = ('submitted_at', 'updated_at', 'reviewed_at', 'reviewed_by')
    raw_id_fields = ('user',)
    
    fieldsets = (
        ('Vendor', {
            'fields': ('user', 'business_name', 'nin')
        }),
        ('Store Location', {
            'fields': ('store_address', 'store_city', 'store_state', 'store_landmark')
        }),
        ('Store Images', {
            'fields': ('store_image_1', 'store_image_2', 'store_image_3')
        }),
        ('Additional Info', {
            'fields': ('years_in_business', 'products_sold')
        }),
        ('Verification Status', {
            'fields': ('status', 'rejection_reason', 'reviewed_by', 'reviewed_at')
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_selected', 'reject_selected']
    
    def approve_selected(self, request, queryset):
        for verification in queryset.filter(status='PENDING'):
            verification.approve(request.user)
        self.message_user(request, f"Approved {queryset.count()} verification(s)")
    approve_selected.short_description = "Approve selected verifications"
    
    def reject_selected(self, request, queryset):
        queryset.filter(status='PENDING').update(status='REJECTED', rejection_reason='Bulk rejection by admin')
        self.message_user(request, f"Rejected {queryset.count()} verification(s)")
    reject_selected.short_description = "Reject selected verifications"
