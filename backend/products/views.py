from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Category, DealOfTheDay
from .serializers import ProductSerializer, CategorySerializer, DealOfTheDaySerializer
from utils.response import generate_api_response
from core.success_codes import SuccessCodes as SC
from django.db import models


class ProductList(APIView):
    def get(self, request):
        # Get query parameters
        category_param = request.query_params.get('category')
        
        # Start with all products
        products = Product.objects.all()
        
        # Apply category filter if provided
        if category_param:
            # Format from URL: Convert hyphens to spaces and capitalize words
            category_words = category_param.replace('-', ' ').split()
            category_display_name = ' '.join([word.capitalize() for word in category_words])
            
            try:
                # First try exact match with display name
                category = Category.objects.get(name__iexact=category_display_name)
                products = products.filter(category=category)
            except Category.DoesNotExist:
                # If no exact match, try partial matches
                if '-' in category_param:
                    # For subcategories like "men-shoes", "women-clothing"
                    main_category, sub_category = category_param.split('-', 1)
                    
                    # Try to find by main category + filtering by substring
                    try:
                        main_cat_words = main_category.replace('-', ' ').split()
                        main_cat_display = ' '.join([word.capitalize() for word in main_cat_words])
                        main_cat = Category.objects.get(name__iexact=main_cat_display)
                        
                        # Filter products in the main category where product name or description contains the sub-category
                        products = products.filter(
                            category=main_cat
                        ).filter(
                            models.Q(name__icontains=sub_category) | 
                            models.Q(description__icontains=sub_category)
                        )
                    except Category.DoesNotExist:
                        # If main category not found, try to find any category with matching name (partial)
                        matching_categories = Category.objects.filter(
                            models.Q(name__icontains=main_category.replace('-', ' ')) | 
                            models.Q(name__icontains=sub_category.replace('-', ' '))
                        )
                        if matching_categories.exists():
                            products = products.filter(category__in=matching_categories)
                else:
                    # For main categories that don't match exactly
                    matching_categories = Category.objects.filter(
                        name__icontains=category_param.replace('-', ' ')
                    )
                    if matching_categories.exists():
                        products = products.filter(category__in=matching_categories)
        
        serializer = ProductSerializer(products, many=True)
        return generate_api_response(
            success=True,
            message="",
            data=serializer.data,
            code=SC.REQ_DATA_RETRIEVED.value,
            status_code=status.HTTP_200_OK
        )


class ProductDetail(APIView):
    def get_object(self, pk):
        try:
            return Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def get(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductSerializer(product)
        return generate_api_response(
            success=True,
            message="",
            data=serializer.data,
            code=SC.REQ_DATA_RETRIEVED.value,
            status_code=status.HTTP_200_OK
        )


class CategoryList(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return generate_api_response(
            success=True,
            message="",
            data=serializer.data,
            code=SC.REQ_DATA_RETRIEVED.value,
            status_code=status.HTTP_200_OK
        )


class CategoryDetail(APIView):
    def get_object(self, pk):
        try:
            return Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def get(self, request, pk):
        category = self.get_object(pk)
        serializer = CategorySerializer(category)
        return generate_api_response(
            success=True,
            message="",
            data=serializer.data,
            code=SC.REQ_DATA_RETRIEVED.value,
            status_code=status.HTTP_200_OK
        )


class DealOfTheDayView(APIView):
    def get(self, request):
        today = timezone.now()
        deals = DealOfTheDay.objects.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        )
        serializer = DealOfTheDaySerializer(deals, many=True)
        return generate_api_response(
            success=True,
            message="",
            data=serializer.data,
            code=SC.REQ_DATA_RETRIEVED.value,
            status_code=status.HTTP_200_OK
        )


class ProductSearchView(APIView):
    """API view for searching products by name, description or category"""
    
    def get(self, request):
        query = request.query_params.get('q', '')
        
        if not query or len(query) < 2:
            return generate_api_response(
                success=False,
                message="Search query must be at least 2 characters",
                data=[],
                code="SEARCH_QUERY_TOO_SHORT",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Search in product name, description and category name
        products = Product.objects.filter(
            models.Q(name__icontains=query) | 
            models.Q(description__icontains=query) |
            models.Q(category__name__icontains=query)
        ).distinct()[:10]  # Limit to 10 results for performance
        
        serializer = ProductSerializer(products, many=True)
        
        return generate_api_response(
            success=True,
            message=f"Found {len(serializer.data)} products matching '{query}'",
            data=serializer.data,
            code=SC.REQ_DATA_RETRIEVED.value,
            status_code=status.HTTP_200_OK
        )
