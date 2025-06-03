from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ContactMessage
from .serializers import ContactMessageSerializer
from utils.response import generate_api_response
from core.success_codes import SuccessCodes as SC
from core.error_codes import ErrorCodes as EC

class ContactMessageView(APIView):
    """
    API view to create a new contact message
    """
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return generate_api_response(
                success=True,
                message="Thank you for your message. We'll get back to you soon!",
                data=serializer.data,
                code=SC.CRE_RESOURCE_CREATED.value,
                status_code=status.HTTP_201_CREATED
            )
        return generate_api_response(
            success=False,
            message="Invalid data provided",
            errors=serializer.errors,
            code=EC.VAL_INVALID_FORMAT.value,
            status_code=status.HTTP_400_BAD_REQUEST
        )