from django.db import models
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import AbstractUser

class CUser(AbstractUser):
    uid = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255, unique=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, max_length=150, db_index=True)
    email_verified = models.BooleanField(default=False)
    contact_number = models.IntegerField(default=0)

    def __str__(self):
        return self.username



class PasswordReset(models.Model):
    email = models.ForeignKey(CUser, on_delete=models.CASCADE, to_field='email')
    token = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=3)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at


