from django.urls import path, include

from products import views

app_name = 'products'


urlpatterns = [
    # Product URLs
    path('products/', include([
        path('deal-of-the-day/', views.DealOfTheDayView.as_view(), name='deal-of-the-day'),
        path('search/', views.ProductSearchView.as_view(), name='product-search'),
        path('<int:pk>/', views.ProductDetail.as_view(), name='product-detail'),
        path('', views.ProductList.as_view(), name='product-list'),
    ])),
    
    # Category URLs
    path('categories/', include([
        path('', views.CategoryList.as_view(), name='category-list'),
        path('<int:pk>/', views.CategoryDetail.as_view(), name='category-detail'),
    ]))
]

