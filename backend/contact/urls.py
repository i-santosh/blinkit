from django.urls import path
from . import views

app_name = 'contact'

urlpatterns = [
    path('submit/', views.ContactMessageView.as_view(), name='contact-submit'),
] 