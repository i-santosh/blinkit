from rest_framework import serializers
from .models import DeliveryArea

class DeliveryAreaSerializer(serializers.ModelSerializer):
    """
    Serializer for DeliveryArea model
    """
    class Meta:
        model = DeliveryArea
        fields = [
            'id', 'city', 'state', 'pin_code', 
            'is_active', 'delivery_charges', 
            'estimated_delivery_days'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class DeliveryAreaListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing delivery areas
    """
    class Meta:
        model = DeliveryArea
        fields = ['id', 'city', 'state', 'pin_code']

class DeliveryAreaCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating delivery areas
    """
    class Meta:
        model = DeliveryArea
        fields = [
            'city', 'state', 'pin_code', 
            'is_active', 'delivery_charges', 
            'estimated_delivery_days'
        ]
        
    def validate(self, data):
        """
        Additional validation for creating/updating delivery areas
        """
        # Ensure pin code is unique across city and state
        existing_area = DeliveryArea.objects.filter(
            city=data.get('city'), 
            state=data.get('state')
        ).first()
        
        if existing_area and self.instance != existing_area:
            raise serializers.ValidationError({
                'city': 'A delivery area for this city and state already exists.'
            })
        
        return data 