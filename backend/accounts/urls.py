from django.urls import path, include

from accounts import views

app_name = 'accounts'


urlpatterns = [
    # User Profile Information
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    # Authentication
    path('signup/', views.SignUpView.as_view(), name='signup'),
    path('signin/', views.SignInView.as_view(), name='signin'),
    path('token/refresh/', views.MyCustomTokenRefreshView.as_view(), 
        name='token-refresh'),
    
    # Email Verification
    path('email/', include([
        path('send/', views.SendEmailVerificationLinkView.as_view(), 
            name='send-email'),
        path('verify/', views.VerifyEmailView.as_view(), 
            name='verify-email'),
    ])),
    
    # Password Management
    path('password/', include([
        path('change/', views.ChangePasswordView.as_view(), 
            name='password-change'),

        path('reset/', include([
            path('verify-token/', views.VerifyTokenView.as_view(), 
                name='password-reset-token-verify'),
            path('', views.ResetPasswordView.as_view(), 
                name='password-reset'),
            path('request/', views.RequestPasswordResetView.as_view(), 
                name='password-reset-request'),
        ]))
    ]))
]