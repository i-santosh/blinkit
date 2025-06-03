from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns

# API Versions
API_V1 = 'api/v1/'

urlpatterns = [
    path('i18n/', include('django.conf.urls.i18n')),
    path('admin/', admin.site.urls),
    path(API_V1, include([
        path('accounts/', include('accounts.urls')),
        path('products/', include('products.urls')),
        path('orders/', include('orders.urls')),
        path('contact/', include('contact.urls')),

        # # Razorpay Webhook Handler
        # path('razorpay/webhooks/', razorpay_webhook, name='razorpay-webhook'),

    ])),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
