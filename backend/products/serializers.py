from rest_framework import serializers
from .models import Product, Category, ProductImage, DealOfTheDay

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'thumbnail']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text']

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    thumbnail = serializers.ImageField(required=False, allow_null=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'thumbnail', 'images', 'created_at', 'updated_at']


class DealOfTheDaySerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    
    class Meta:
        model = DealOfTheDay
        fields = [
            'id', 
            'product',
            'deal_price', 
            'start_date',
            'end_date',
            'is_active'
        ]

