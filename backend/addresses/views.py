from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.views import CoreAPIView
from core.success_codes import SuccessCodes as SC
from core.error_codes import ErrorCodes as EC

from .models import DeliveryArea
from .serializers import (
    DeliveryAreaSerializer, 
    DeliveryAreaListSerializer, 
    DeliveryAreaCreateUpdateSerializer
)

class DeliveryAreaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing delivery areas
    """
    queryset = DeliveryArea.objects.all()
    permission_classes = [permissions.IsAdminUser]
    
    def get_serializer_class(self):
        """
        Return different serializers based on the action
        """
        if self.action == 'list':
            return DeliveryAreaListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DeliveryAreaCreateUpdateSerializer
        return DeliveryAreaSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Custom create method with enhanced response
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(
            {
                'success': True,
                'message': 'Delivery area created successfully',
                'code': SC.CRE_RESOURCE_CREATED.value,
                'data': DeliveryAreaSerializer(serializer.instance).data
            },
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        """
        Custom update method with enhanced response
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(
            {
                'success': True,
                'message': 'Delivery area updated successfully',
                'code': SC.UPD_RESOURCE_MODIFIED.value,
                'data': DeliveryAreaSerializer(serializer.instance).data
            },
            status=status.HTTP_200_OK
        )
    
    def destroy(self, request, *args, **kwargs):
        """
        Custom destroy method with enhanced response
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response(
            {
                'success': True,
                'message': 'Delivery area deleted successfully',
                'code': SC.DEL_RESOURCE_REMOVED.value
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['GET'], permission_classes=[permissions.AllowAny])
    def active_areas(self, request):
        """
        Get all active delivery areas
        """
        active_areas = DeliveryArea.get_active_areas()
        serializer = DeliveryAreaListSerializer(active_areas, many=True)
        
        return Response(
            {
                'success': True,
                'message': 'Active delivery areas retrieved successfully',
                'code': SC.REQ_DATA_RETRIEVED.value,
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        ) 