from rest_framework import permissions, generics
from rest_framework import status

from core.views import CoreAPIView
from core.success_codes import SuccessCodes as SC
from core.error_codes import ErrorCodes as EC
from utils.response import generate_api_response

from .models import Pincode
from .serializers import PincodeSerializer

class PincodeListView(generics.ListAPIView):
    """
    A view to list all serviceable pincodes
    """
    queryset = Pincode.objects.all()
    serializer_class = PincodeSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        """
        List all serviceable pincodes
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return generate_api_response(
            success=True,
            message="Serviceable pincodes retrieved successfully",
            code=SC.REQ_DATA_RETRIEVED.value,
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

class PincodeCheckView(CoreAPIView):
    """
    A view to check if a pincode is serviceable
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """
        Check if a pincode is serviceable
        """
        pincode = request.query_params.get('pincode', None)
        
        if not pincode:
            return generate_api_response(
                success=False,
                message="Pincode is required",
                code=EC.VAL_MISSING_FIELD.value,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Check if pincode exists
            Pincode.objects.get(pincode=pincode)
            return generate_api_response(
                success=True,
                message="Pincode is serviceable",
                code=SC.REQ_DATA_RETRIEVED.value,
                data={'serviceable': True},
                status_code=status.HTTP_200_OK
            )
        except Pincode.DoesNotExist:
            return generate_api_response(
                success=False,
                message="Pincode is not serviceable",
                code=EC.RES_NOT_FOUND.value,
                data={'serviceable': False},
                status_code=status.HTTP_404_NOT_FOUND
            )
