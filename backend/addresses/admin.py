from django.contrib import admin
from .models import Pincode

@admin.register(Pincode)
class PincodeAdmin(admin.ModelAdmin):
    list_display = ('pincode',)
    search_fields = ('pincode',)
