from django.contrib import admin
from .models import Category, Product, ProductImage, DealOfTheDay


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "description", "is_active"]
    list_filter = ["is_active"]
    search_fields = ("name", "description")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "description", "tag", "price", "category","updated_at", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ("name", "description")
    list_editable = ["price", "is_active"]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ["image", "alt_text"]


@admin.register(DealOfTheDay)
class DealOfTheDayAdmin(admin.ModelAdmin):
    list_display = ['product', 'deal_price', 'start_date', 'end_date', 'is_active']
    list_filter = ['is_active', 'start_date', 'end_date']
    search_fields = ['product__name']
    raw_id_fields = ['product']
