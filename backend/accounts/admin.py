from django.contrib import admin
from .models import CUser, PasswordReset

admin.site.site_header = "BOSS ECOM Admin Panel"       # Header text
admin.site.site_title = "BOSS ECOM Admin"             # Browser tab title
admin.site.index_title = "Welcome to BOSS ECOM Admin" # Dashboard title

@admin.register(CUser)
class CUserAdmin(admin.ModelAdmin):
    list_display = ["full_name", "email"]


@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
    list_display = ["email", "token", "created_at", "expires_at"]

