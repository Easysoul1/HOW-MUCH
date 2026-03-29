from django.contrib import admin
from .models import SavedItem


@admin.register(SavedItem)
class SavedItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'listing', 'saved_at')
    list_filter = ('saved_at',)
    search_fields = ('user__email', 'listing__product__name')
    raw_id_fields = ('user', 'listing')
    readonly_fields = ('saved_at',)
