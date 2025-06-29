from django.db import models
from django.core.validators import RegexValidator

class DeliveryArea(models.Model):
    """
    Model to manage delivery areas with cities and pin codes
    """
    STATE_CHOICES = [
        ('DL', 'Delhi'),
        ('HR', 'Haryana'),
        ('UP', 'Uttar Pradesh'),
        ('PB', 'Punjab'),
        ('RJ', 'Rajasthan'),
        ('MH', 'Maharashtra'),
        ('KA', 'Karnataka'),
        ('TN', 'Tamil Nadu'),
        ('WB', 'West Bengal'),
        ('GJ', 'Gujarat'),
    ]
    
    # Validate pin code format
    pin_code_validator = RegexValidator(
        regex=r'^\d{6}$', 
        message='Pin code must be 6 digits'
    )
    
    city = models.CharField(max_length=100, verbose_name='City Name')
    state = models.CharField(max_length=2, choices=STATE_CHOICES, verbose_name='State')
    pin_code = models.CharField(
        max_length=6, 
        unique=True, 
        validators=[pin_code_validator],
        verbose_name='Pin Code'
    )
    
    is_active = models.BooleanField(default=True, verbose_name='Delivery Available')
    delivery_charges = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        default=0, 
        verbose_name='Delivery Charges'
    )
    
    estimated_delivery_days = models.PositiveIntegerField(
        default=3, 
        verbose_name='Estimated Delivery Days'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Delivery Area'
        verbose_name_plural = 'Delivery Areas'
        ordering = ['state', 'city']
        unique_together = ['city', 'state']
    
    def __str__(self):
        return f"{self.city}, {self.get_state_display()} - {self.pin_code}"
    
    @classmethod
    def get_active_areas(cls):
        """
        Returns all active delivery areas
        """
        return cls.objects.filter(is_active=True)
    
    def save(self, *args, **kwargs):
        """
        Ensure pin code is saved in a consistent format
        """
        self.pin_code = str(self.pin_code).zfill(6)
        super().save(*args, **kwargs) 