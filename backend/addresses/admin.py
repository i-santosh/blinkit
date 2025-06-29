from django.contrib import admin
from .models import DeliveryArea

@admin.register(DeliveryArea)
class DeliveryAreaAdmin(admin.ModelAdmin):
    """
    Admin configuration for DeliveryArea model
    """
    list_display = (
        'city', 
        'state', 
        'pin_code', 
        'is_active', 
        'delivery_charges', 
        'estimated_delivery_days'
    )
    
    list_filter = (
        'state', 
        'is_active'
    )
    
    search_fields = (
        'city', 
        'state', 
        'pin_code'
    )
    
    list_editable = (
        'is_active', 
        'delivery_charges', 
        'estimated_delivery_days'
    )
    
    ordering = ('state', 'city')
    
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Location Details', {
            'fields': ('city', 'state', 'pin_code')
        }),
        ('Delivery Information', {
            'fields': (
                'is_active', 
                'delivery_charges', 
                'estimated_delivery_days'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def has_delete_permission(self, request, obj=None):
        """
        Prevent deletion of active delivery areas
        """
        if obj and obj.is_active:
            return False
        return super().has_delete_permission(request, obj) 