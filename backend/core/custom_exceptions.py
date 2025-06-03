from typing import Dict, Any, Optional
from rest_framework.exceptions import APIException

from utils.response import generate_api_response
from .error_codes import ErrorCodes, ErrorHandler

class CoreAPIException(APIException):
    """Enhanced API Exception with comprehensive error reporting"""
    def __init__(self,
                 error_code: ErrorCodes,
                 message: Optional[str] = None,
                 extra_context: Optional[Dict[str, Any]] = None):
        
        self.error_details = ErrorHandler.get_error_details(error_code)
        self.message = message or self.error_details['message']
        self.error_code = error_code.value
        # Properly call parent class constructor with both detail and code
        super().__init__(detail=self.message, code=self.error_code)
        self.status_code = self.error_details['http_status_code']
        
        self.extra_context = extra_context or {
            "action": self.error_details['recommended_action']
        }

    def get_full_details(self):
        print(self.message)
        return generate_api_response(
            success=False,
            message=self.message,
            code=self.error_code,
            errors=self.error_details,
            extra_context=self.extra_context,
            status_code=self.status_code,
        )