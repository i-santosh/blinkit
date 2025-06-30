from django.db import models

# Create your models here.

class Pincode(models.Model):
    pincode = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.pincode

    class Meta:
        verbose_name = 'Pincode'
        verbose_name_plural = 'Pincodes'
