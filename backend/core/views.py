import time
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from django.db import (
    DatabaseError, 
    IntegrityError, 
    transaction
)
from django.core.exceptions import (
    ObjectDoesNotExist, 
    ValidationError as DjangoValidationError,
    PermissionDenied as DjangoPermissionDenied
)
from rest_framework.exceptions import (
    ValidationError,
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    NotFound,
    ParseError,
    UnsupportedMediaType,
    Throttled
)

from .logging_utils import LoggingMixin
from .custom_exceptions import CoreAPIException
from .error_codes import ErrorHandler as EH, ErrorCodes as EC
from utils.response import generate_api_response

class CoreAPIView(APIView, LoggingMixin):
    """
    Comprehensive base API view with enhanced features:
    - Centralized exception handling
    - Logging utilities
    - Authentication and permission controls
    - Request/Response processing/logging
    """
    
    # Logging configuration
    logging_enabled = True

    def dispatch(self, request, *args, **kwargs):
        """
        Enhanced dispatch method with request logging and 
        Comprehensive exception handling during request dispatch
        """

        request_id = None
        start_time = time.time()
        
        try:

            # Pre-processing and request logging
            request_id = self.pre_process_request(request) if self.logging_enabled else None

            # Process the request
            with transaction.atomic():
                response = super().dispatch(request, *args, **kwargs)

            # Ensure response has a renderer
            if not hasattr(response, 'accepted_renderer'):
                response.accepted_renderer = self.get_renderers()[0]
                response.accepted_media_type = self.get_renderers()[0].media_type
                response.renderer_context = self.get_renderer_context()

            # Post-processing and response logging
            if self.logging_enabled:
                response_time = round((time.time() - start_time) * 1000, 2)  # ms
                self.post_process_response(
                    response, 
                    request_id,
                    extra_context={'response_time': response_time}
                )      
            
            return response
        
        except Exception as exc:

            # Ensure logging even if exception occurs
            if self.logging_enabled:
                response_time = round((time.time() - start_time) * 1000, 2)
                self.log_exception(exc, extra_context={
                    'request_id': request_id,
                    'response_time': response_time
                })

            # Delegate to comprehensive exception handler
            error_response = self.handle_exception(exc)
            
            # Ensure error response has a renderer
            if not hasattr(error_response, 'accepted_renderer'):
                error_response.accepted_renderer = self.get_renderers()[0]
                error_response.accepted_media_type = self.get_renderers()[0].media_type
                error_response.renderer_context = self.get_renderer_context()

            return error_response

    def pre_process_request(self, request):
        """Pre-processing hook for request logging"""
        return self.log_request(request)

    def post_process_response(self, response, request_id, extra_context=None):
        """Post-processing hook for response logging"""
        self.log_response(request_id, response, extra_context)
    
    def handle_exception(self, exc):
        """
        Advanced exception handling with detailed logging and response
        """

        # Authentication Exceptions
        if isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            return self._handle_authentication_error(exc)
        
        # Validation Exceptions
        if isinstance(exc, (ValidationError, DjangoValidationError)):
            return self._handle_validation_error(exc)
        
        # Permission Exceptions
        if isinstance(exc, (PermissionDenied, DjangoPermissionDenied)):
            return self._handle_permission_error(exc)
        
        # Resource Not Found Exceptions
        if isinstance(exc, (NotFound, ObjectDoesNotExist)):
            return self._handle_not_found_error(exc)
        
        # Database Exceptions
        if isinstance(exc, (DatabaseError, IntegrityError)):
            return self._handle_database_error(exc)
        
        # Request Parsing Exceptions
        if isinstance(exc, (ParseError, UnsupportedMediaType)):
            return self._handle_request_parsing_error(exc)
        
        # Rate Limiting Exceptions
        if isinstance(exc, Throttled):
            return self._handle_rate_limit_error(exc)
        
        # Custom CoreAPIException
        if isinstance(exc, CoreAPIException):
            return self._handle_core_api_exception(exc)
        
        # Catch-all for unexpected exceptions
        return self._handle_unexpected_error(exc)

    def _handle_authentication_error(self, exc):
        """
        Handle authentication-related errors using ErrorHandler
        """
        err_code: EC = EC.AUTH_INVALID_CREDENTIALS
        error_details = EH.get_error_details(err_code)

        # Check if the exception has a custom message and use it, otherwise fall back to default message
        message = {error_details['message']}

        return generate_api_response(
            success=False,
            message=message,
            code=err_code.value,
            errors={"detail": str(exc)},
            status_code=error_details['http_status_code'],
            extra_context={"action": error_details['recommended_action']}
        )

    def _handle_validation_error(self, exc):
        """
        Handle validation errors using ErrorHandler
        """
        err_code: EC = EC.VAL_INVALID_FORMAT
        error_details = EH.get_error_details(err_code)

        errors = (exc.detail if hasattr(exc, 'detail') 
                  else getattr(exc, 'message_dict', {'non_field_errors': [str(exc)]}))
        
        # Check if the exception has a custom message and use it, otherwise fall back to default message
        message = {errors['non_field_errors'][0] if 'non_field_errors'in errors
                   else error_details['message']}

        return generate_api_response(
            success=False,
            message=message,
            code=err_code.value,
            errors=errors,
            status_code=error_details['http_status_code'],
            extra_context={"action": error_details['recommended_action']}
        )

    def _handle_permission_error(self, exc):
        """
        Handle permission-related errors using ErrorHandler
        """
        err_code: EC = EC.PERM_ACTION_FORBIDDEN
        error_details = EH.get_error_details(err_code)

        # Check if the exception has a custom message and use it, otherwise fall back to default message
        message = {error_details['message']}

        return generate_api_response(
            success=False,
            message=message,
            code=err_code.value,
            errors={"detail": str(exc)},
            status_code=error_details['http_status_code'],
            extra_context={"action": error_details['recommended_action']}
        )

    def _handle_not_found_error(self, exc):
        """
        Handle resource not found errors using ErrorHandler
        """
        err_code: EC = EC.RES_NOT_FOUND
        error_details = EH.get_error_details(err_code)

        # Check if the exception has a custom message and use it, otherwise fall back to default message
        message = error_details['message']

        return generate_api_response(
            success=False,
            message=message,
            code=err_code.value,
            errors={"detail": str(exc)},
            status_code=error_details['http_status_code'],
            extra_context={"action": error_details['recommended_action']}
        )

    def _handle_database_error(self, exc):
        """
        Handle database-related errors using ErrorHandler
        """
        print(exc)
        err_code: EC = EC.SYS_INTERNAL_ERROR
        error_details = EH.get_error_details(err_code)

        # Check if the exception has a custom message and use it, otherwise fall back to default message
        message = {error_details['message']}
        
        
        return generate_api_response(
            success=False,
            message=message,
            code=err_code.value,
            errors={"detail": str(exc)},
            status_code=error_details['http_status_code'],
            extra_context={"action": error_details['recommended_action']}
        )

    def _handle_request_parsing_error(self, exc):
        """
        Handle request parsing errors using ErrorHandler
        """
        err_code: EC = EC.REQ_PARSE_FAILED
        error_details = EH.get_error_details(err_code)

        # Check if the exception has a custom message and use it, otherwise fall back to default message
        message = {error_details['message']}

        return generate_api_response(
            success=False,
            message=message,
            code=err_code.value,
            errors={"detail": str(exc)},
            status_code=error_details['http_status_code'],
            extra_context={"action": error_details['recommended_action']}
        )

    def _handle_rate_limit_error(self, exc):
        """
        Handle rate limiting errors using ErrorHandler
        """
        err_code: EC = EC.REQ_RATE_LIMIT_EXCEEDED
        error_details = EH.get_error_details(err_code)

        # Check if the exception has a custom message and use it, otherwise fall back to default message
        message = {error_details['message']}

        return generate_api_response(
            success=False,
            message=message,
            code=err_code.value,
            errors={"detail": str(exc)},
            extra_context={'wait': getattr(exc, 'wait', None)},
            status_code=error_details['http_status_code'],
        )

    def _handle_core_api_exception(self, exc):
        """
        Handle custom CoreAPIException
        """
        return exc.get_full_details()

    def _handle_unexpected_error(self, exc):
        """
        Handle unexpected/unhandled exceptions using ErrorHandler
        """
        print(exc)
        err_code: EC = EC.SYS_INTERNAL_ERROR
        error_details = EH.get_error_details(err_code)

        # Check if the exception has a custom message and use it, otherwise fall back to default message
        message = {error_details['message']}

        return generate_api_response(
            success=False,
            message=message,
            code=err_code.value,
            errors={"detail": str(exc)},
            status_code=error_details['http_status_code'],
            extra_context={"action": error_details['recommended_action']}
        )

    def _handle_critical_error(self, exc):
        """
        Handle critical errors in exception handling using ErrorHandler
        """
        err_code: EC = EC.CRIT_SYSTEM_FAILURE
        error_details = EH.get_error_details(err_code)

        # Check if the exception has a custom message and use it, otherwise fall back to default message
        message = {error_details['message']}

        return generate_api_response(
            success=False,
            message=message,
            code=err_code.value,
            errors={'detail': 'An unrecoverable error occurred'},
            status_code=error_details['http_status_code'],
            extra_context={"action": error_details['recommended_action']}
        )