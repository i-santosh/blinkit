import secrets
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from constants import *


class EmailService:
    @staticmethod
    def generate_token():
        """Generate a secure token for email verification or password reset"""
        return secrets.token_urlsafe(32)


    @staticmethod
    def send_confirm_email_notification(user_email, confirmation_link):
        """Send email to user to confirm email"""
        subject = f'Confirm Your Email Address for Boss'
        context = {
            'confirmation_link': confirmation_link,
            'FOOTER_L1': EMAIL_FOOTER_L1,
            'FOOTER_L2': EMAIL_FOOTER_L2,
        }
        html_message = render_to_string('emails/auth/confirm_email.html', context)

        send_mail(
            subject,
            'Thank you for signing up for Boss! Please confirm your email',
            f"Boss <{settings.DEFAULT_FROM_EMAIL}>",
            [user_email],
            html_message=html_message,
        )


    @staticmethod
    def send_email_confirmed_notification(name, user_email):
        """Send email to user about successfully email verified"""
        subject = f'Email Verification Successful'
        context = {
            'user_name': name,
            'FOOTER_L1': EMAIL_FOOTER_L1,
            'FOOTER_L2': EMAIL_FOOTER_L2,
        }
        html_message = render_to_string('emails/auth/email_verified.html', context)

        send_mail(
            subject,
            'Congratulations! Your email address has been successfully verified.',
            f"Boss <{settings.DEFAULT_FROM_EMAIL}>",
            [user_email],
            html_message=html_message,
        )


    @staticmethod
    def send_password_reset_email(email, reset_url):
        """Send password reset link"""
        subject = 'Password Reset Request'

        context = {
            'reset_link': reset_url,
            'FOOTER_L1': EMAIL_FOOTER_L1,
            'FOOTER_L2': EMAIL_FOOTER_L2,
        }
        html_message = render_to_string('emails/auth/reset_password.html', context)

        send_mail(
            subject,
            'Password Reset Request',
            f"Boss <{settings.DEFAULT_FROM_EMAIL}>",
            [email],
            html_message=html_message,
        )


