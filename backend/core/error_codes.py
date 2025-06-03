from enum import Enum, unique
from rest_framework.status import *
from typing import Dict, Any


@unique
class ErrorCodes(Enum):
    """
    Centralized and comprehensive error code management with enhanced error details.
    
    Error Code Structure:
    - Prefix indicates error category
    - Middle section describes specific error type
    - Suffix provides unique identifier
    
    Error Code Prefix Convention:
    - AUTH: Authentication errors
    - VAL: Validation errors
    - PERM: Permission errors
    - RES: Resource errors
    - SYS: System errors
    - REQ: Request errors
    - CRIT: Critical/Unrecoverable errors
    """
    
    # Authentication Errors
    AUTH_INVALID_CREDENTIALS = 'AUTH_LOGIN_CREDENTIALS_FAILED'
    AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_SESSION_EXPIRED'
    AUTH_MFA_REQUIRED = 'AUTH_MULTI_FACTOR_REQUIRED'
    AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_SECURITY_LOCKED'
    
    # Validation Errors
    VAL_INVALID_FORMAT = 'VAL_INPUT_FORMAT_INCORRECT'
    VAL_FIELD_REQUIRED = 'VAL_REQUIRED_FIELD_MISSING'
    VAL_LENGTH_EXCEEDED = 'VAL_INPUT_LENGTH_EXCEEDED'
    
    # Permission Errors
    PERM_INSUFFICIENT_ACCESS = 'PERM_USER_ROLE_INSUFFICIENT'
    PERM_ACTION_FORBIDDEN = 'PERM_ACTION_NOT_AUTHORIZED'
    
    # Resource Errors
    RES_NOT_FOUND = 'RES_RESOURCE_DOES_NOT_EXIST'
    RES_ALREADY_EXISTS = 'RES_RESOURCE_DUPLICATE'
    RES_CONFLICT = 'RES_STATE_CONFLICT'
    RES_DELETED = 'RES_RESOURCE_PREVIOUSLY_DELETED'
    
    # System Errors
    SYS_INTERNAL_ERROR = 'SYS_UNEXPECTED_CONDITION'
    SYS_DATABASE_CONN = 'SYS_DATABASE_CONNECTION_FAILED'
    SYS_EXTERNAL_SERVICE_TIMEOUT = 'SYS_EXTERNAL_SERVICE_UNRESPONSIVE'
    SYS_CONFIGURATION = 'SYS_CONFIGURATION_INVALID'
    
    # Request Errors
    REQ_PARSE_FAILED = 'REQ_PAYLOAD_PARSING_ERROR'
    REQ_RATE_LIMIT_EXCEEDED = 'REQ_RATE_LIMIT_MAXIMUM_REACHED'
    REQ_METHOD_NOT_ALLOWED = 'REQ_HTTP_METHOD_UNSUPPORTED'
    
    # Critical/Unrecoverable Errors
    CRIT_DATA_CORRUPTION = 'CRIT_DATA_INTEGRITY_COMPROMISED'
    CRIT_SYSTEM_FAILURE = 'CRIT_SYSTEM_CORE_FUNCTIONALITY_LOST'


class ErrorHandler:
    """
    Comprehensive error handling utility to provide detailed error information.
    """
    
    @staticmethod
    def get_error_details(error_code: ErrorCodes) -> Dict[str, Any]:
        """
        Retrieve detailed information about a specific error code.
        
        Args:
            error_code (ErrorCodes): The error code to get details for.
        
        Returns:
            Dict[str, Any]: A dictionary containing comprehensive error details.
        """
        error_details = {
            # Authentication Errors
            ErrorCodes.AUTH_INVALID_CREDENTIALS: {
                'message': 'Login failed. Invalid username or password.',
                'http_status_code': HTTP_401_UNAUTHORIZED,
                'recommended_action': 'Verify credentials and try again',
            },
            ErrorCodes.AUTH_TOKEN_EXPIRED: {
                'message': 'Authentication session has expired.',
                'http_status_code': HTTP_401_UNAUTHORIZED,
                'recommended_action': 'Re-authenticate and obtain a new token',
            },
            ErrorCodes.AUTH_MFA_REQUIRED: {
                'message': 'Multi-factor authentication is required.',
                'http_status_code': HTTP_403_FORBIDDEN,
                'recommended_action': 'Complete multi-factor authentication',
            },
            ErrorCodes.AUTH_ACCOUNT_LOCKED: {
                'message': 'Account has been temporarily locked due to multiple failed attempts.',
                'http_status_code': HTTP_403_FORBIDDEN,
                'recommended_action': 'Reset password or contact support',
            },
            
            # Validation Errors
            ErrorCodes.VAL_INVALID_FORMAT: {
                'message': 'Input does not match the required format.',
                'http_status_code': HTTP_400_BAD_REQUEST,
                'recommended_action': 'Check input format and resubmit',
            },
            ErrorCodes.VAL_FIELD_REQUIRED: {
                'message': 'Required field is missing.',
                'http_status_code': HTTP_400_BAD_REQUEST,
                'recommended_action': 'Provide all mandatory fields',
            },
            ErrorCodes.VAL_LENGTH_EXCEEDED: {
                'message': 'Input length exceeds maximum allowed limit.',
                'http_status_code': HTTP_400_BAD_REQUEST,
                'recommended_action': 'Reduce input length to meet requirements',
            },
            
            # Permission Errors
            ErrorCodes.PERM_INSUFFICIENT_ACCESS: {
                'message': 'Insufficient permissions to perform this action.',
                'http_status_code': HTTP_403_FORBIDDEN,
                'recommended_action': 'Request appropriate access level',
            },
            ErrorCodes.PERM_ACTION_FORBIDDEN: {
                'message': 'Permission denied to perform this action.',
                'http_status_code': HTTP_403_FORBIDDEN,
                'recommended_action': 'Request appropriate access level',
            },
            
            # Resource Errors
            ErrorCodes.RES_NOT_FOUND: {
                'message': 'Requested resource does not exist.',
                'http_status_code': HTTP_404_NOT_FOUND,
                'recommended_action': 'Verify resource identifier and try again',
            },
            ErrorCodes.RES_ALREADY_EXISTS: {  # Fixed here
                'message': 'Requested resource already exists.',
                'http_status_code': HTTP_409_CONFLICT,  # Changed to 409
                'recommended_action': 'Verify resource identifier and try again',
            },
            ErrorCodes.RES_DELETED: {
                'message': "Requested resource doesn't exist.",
                'http_status_code': HTTP_404_NOT_FOUND,
                'recommended_action': 'Verify resource identifier and try again',
            },
            
            # System Errors
            ErrorCodes.SYS_INTERNAL_ERROR: {
                'message': 'An unexpected internal system error occurred.',
                'http_status_code': HTTP_500_INTERNAL_SERVER_ERROR,
                'recommended_action': 'Contact system administrator',
            },
            ErrorCodes.SYS_DATABASE_CONN: {
                'message': 'Unable to establish database connection.',
                'http_status_code': HTTP_500_INTERNAL_SERVER_ERROR,
                'recommended_action': 'Retry after a short wait or contact support',
            },
            
            # Request Errors
            ErrorCodes.REQ_PARSE_FAILED: {
                'message': "Couldn't load the Request.",
                'http_status_code': HTTP_400_BAD_REQUEST,
                'recommended_action': 'Wait and retry after specified cooldown',
            },
            ErrorCodes.REQ_RATE_LIMIT_EXCEEDED: {
                'message': 'Too many requests. Rate limit exceeded.',
                'http_status_code': HTTP_429_TOO_MANY_REQUESTS,
                'recommended_action': 'Wait and retry after specified cooldown',
            },
            ErrorCodes.REQ_METHOD_NOT_ALLOWED: {
                'message': 'Method not allowed.',
                'http_status_code': HTTP_405_METHOD_NOT_ALLOWED,
                'recommended_action': '',
            },
            
            # Critical Errors
            ErrorCodes.CRIT_DATA_CORRUPTION: {
                'message': 'Critical data integrity issue detected.',
                'http_status_code': HTTP_500_INTERNAL_SERVER_ERROR,
                'recommended_action': 'Contact system administrator.',
            }
        }
        
        return error_details.get(error_code, {
            'message': 'Unknown error occurred',
            'http_status_code': 500,
            'recommended_action': 'Contact system administrator',
        })
