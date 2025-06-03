from django.utils import timezone
import os
current_year = timezone.now().year

PROJECT_NAME='BLINKIT'
PROJECT_WEBSITE_NAME='blinkit.com'
PROJECT_WEBSITE_NAME_HTTPS='https://blinkit.com'
COOKIES_DOMAIN=f'.{PROJECT_WEBSITE_NAME}'
ACCESS_TOKEN_NAME='access'
REFRESH_TOKEN_NAME='refresh'
EMAIL_FOOTER_L1 =f'Blinkit © {current_year } All Rights Reserved.'
EMAIL_FOOTER_L2=''

RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')