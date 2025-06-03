import logging
import traceback
import uuid
import time
from typing import Dict, Any, Optional
from django.http import HttpRequest
from rest_framework.response import Response


class LoggingMixin:
    """Comprehensive logging mixin for API views"""
    # Separate loggers for requests, responses and errors
    request_logger = logging.getLogger('request_logger')
    response_logger = logging.getLogger('response_logger')
    error_logger = logging.getLogger('error_logger')

    @classmethod
    def log_request(cls, request: HttpRequest, extra_context: Optional[Dict[str, Any]] = None):
        """Log detailed request information"""
        request_id = str(uuid.uuid4())
        
        log_data = {
            'request_id': request_id,
            'method': request.method,
            'path': request.path,
            'user': request.user.username if request.user.is_authenticated else 'Anonymous',
            'ip_address': cls._get_client_ip(request),
            'query_params': dict(request.GET),
            'headers': dict(request.headers),
            'content_type': request.content_type,
            'content_length': request.META.get('CONTENT_LENGTH', '0'),
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        }
        
        if extra_context:
            log_data.update(extra_context)
        
        # Use structured logging format for requests
        # cls.request_logger.info('Request Received', extra={
        #     'log_type': 'request',
        #     'data': log_data
        # })
        
        return request_id
    
    @classmethod
    def log_response(cls, request_id: str, response: Response, extra_context: Optional[Dict[str, Any]] = None):
        """Log detailed response information with performance metrics"""
        log_data = {
            'request_id': request_id,
            'status_code': response.status_code,
            'content_type': response.get('Content-Type', 'not-set'),
            'content_length': response.get('Content-Length', '0'),
            'response_time': extra_context.get('response_time', 0) if extra_context else 0,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        }
        
        if extra_context:
            log_data.update(extra_context)
        
        # Use structured logging format for responses
        # cls.response_logger.info('Response Sent', extra={
        #     'log_type': 'response',
        #     'data': log_data
        # })

    @classmethod
    def log_exception(cls, exception: Exception, extra_context: Optional[Dict[str, Any]] = None):
        """Comprehensive exception logging with detailed traceback"""
        log_data = {
            'exception_type': type(exception).__name__,
            'exception_message': str(exception),
            'traceback': traceback.format_exc(),
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        }
        
        if extra_context:
            log_data.update(extra_context)
        
        if isinstance(exception, Warning):
            cls.error_logger.warning('Warning Occurred', extra={
                'log_type': 'warning',
                'data': log_data
            })
        else:
            cls.error_logger.error('Exception Occurred', extra={
                'log_type': 'exception',
                'data': log_data
            })

    @staticmethod
    def _get_client_ip(request):
        """Retrieve client IP address with support for proxied requests"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    