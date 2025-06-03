from typing import Dict, Any, Optional
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone, timedelta
from constants import COOKIES_DOMAIN


def generate_api_response(
    success: bool,
    message: str,
    code: str,
    data: Optional[Dict[str, Any]] = None,
    errors: Optional[Dict[str, Any]] = None,
    extra_context: Optional[Dict[str, Any]] = None,
    status_code: int = status.HTTP_200_OK,
    cookies: Optional[Dict[str, Dict[str, Any]]] = None
) -> Response:
    """
    Generate a consistent API response with robust error handling and type checking.
    
    Args:
        `success` (bool): Indicates if the response is a success or failure.
        `message` (str): A descriptive message for the response.
        `code` (str): A unique code for the response (e.g., "ERR_INVALID_INPUT").
        `data` (dict, optional): Data payload for success responses.
        `errors` (dict, optional): Error details for failure responses.
        `extra_context` (dict, optional): Extra details for responses.
        `status_code` (int, optional): HTTP status code. Defaults to HTTP_200_OK,
        `cookies`: (dict, optional): Cookies to set in response.

    Returns:
        Response: A DRF Response object with the structured format.
    
    Raises:
        ValueError: If the response parameters are inconsistent.

    Cookie Configuration Options:
    - `value` (str): Cookie value (required)
    - `expires` (Union[datetime, int, timedelta]): Expiration time
    - `max_age` (Union[int, timedelta]): Maximum age of the cookie
    - `path` (str): Path for the cookie (default: '/')
    - `domain` (str): Domain for the cookie
    - `secure` (bool): Only send over HTTPS
    - `httponly` (bool): Prevent JavaScript access
    - `samesite` (str): CSRF protection ('Lax', 'Strict', 'None')
    """

    # Validate input consistency
    if success and data is None:
        raise ValueError("Success response must include data")
    
    if not success and errors is None:
        raise ValueError("Error response must include errors")
    
    # Construct response
    response = Response(
        {
            "success": success,
            "message": message,
            "code": code,
            **({"data": data} if success and data is not None else {}),
            **({"errors": errors} if not success and errors is not None else {}),
            **({"extra_context": extra_context} if extra_context is not None else {})
        }, 
        status=status_code
    )

    # Set cookies with comprehensive configuration if provided
    if cookies:
        for key, cookie_config in cookies.items():
            # Ensure required 'value' is present
            if 'value' not in cookie_config:
                raise ValueError(f"Cookie '{key}' must have a 'value' specified")
            
            # Prepare cookie configuration
            cookie_params = {
                'value': cookie_config['value'],
                'path': cookie_config.get('path', '/'),
                'httponly': cookie_config.get('httponly', True),
                'secure': cookie_config.get('secure', True),
                'samesite': cookie_config.get('samesite', 'Lax'),
                'domain': cookie_config.get('domain', COOKIES_DOMAIN)
            }

            # Handle expiration
            if 'expires' in cookie_config:
                expires = cookie_config['expires']
                if isinstance(expires, datetime):
                    cookie_params['expires'] = expires
                elif isinstance(expires, int):
                    cookie_params['expires'] = datetime.now(timezone.utc) + timedelta(seconds=expires)
                elif isinstance(expires, timedelta):
                    cookie_params['expires'] = datetime.now(timezone.utc) + expires
            
            # Handle max_age
            if 'max_age' in cookie_config:
                max_age = cookie_config['max_age']
                if isinstance(max_age, timedelta):
                    cookie_params['max_age'] = int(max_age.total_seconds())
                elif isinstance(max_age, int):
                    cookie_params['max_age'] = max_age

            # Set the cookie
            response.set_cookie(key=key, **cookie_params)
    
    return response
