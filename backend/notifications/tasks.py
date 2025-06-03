from .services import EmailService

def send_confirm_email_notification_task(user_email, confirmation_link):
    EmailService.send_confirm_email_notification(user_email, confirmation_link)


def send_email_confirmed_notification_task(name, user_email):
    EmailService.send_email_confirmed_notification(name, user_email)


def send_password_reset_email_task(email, reset_url):
    EmailService.send_password_reset_email(email, reset_url)


