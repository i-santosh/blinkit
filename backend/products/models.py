from django.db import models
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=255)
    thumbnail = models.FileField(upload_to='thumbnails/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)  # Field for thumbnail image
    images = models.ManyToManyField('ProductImage', related_name='products', blank=True)  # Field for additional images
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tag = models.CharField(max_length=50, default='new_arrivals', choices=[('new_arrivals', 'New Arrivals'),
                                                                  ('trending', 'Trending'),
                                                                  ('top_rated', 'Top Rated')])
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    image = models.ImageField(upload_to='products/')  # Field for image
    alt_text = models.CharField(max_length=255, blank=True, null=True)  # Alternative text for the image

    def __str__(self):
        return self.alt_text if self.alt_text else str(self.image)



class DealOfTheDay(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='deals')
    deal_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Deal of the Day'
        verbose_name_plural = 'Deals of the Day'

    def __str__(self):
        return f"Deal: {self.product.name} - {self.deal_price}"

