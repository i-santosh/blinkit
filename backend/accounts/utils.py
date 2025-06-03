import jwt
from datetime import datetime, timedelta
from django.conf import settings
from core.custom_exceptions import CoreAPIException
from core.error_codes import ErrorCodes as EC

def generate_email_verification_token(user, custom_email=None, expiry_hours=2):
    """
    Generate a JWT token for email verification

    Args:
        user: The user model instance
        custom_email: Optional email override (for cases where user wants to verify a new email)
        expiry_hours: Number of hours until token expires

    Returns:
        str: JWT token
    """
    email_to_verify = custom_email if custom_email else user.email

    payload = {
        'user_id': user.uid,
        'email': email_to_verify,
        'exp': datetime.utcnow() + timedelta(hours=expiry_hours),
        'iat': datetime.utcnow(),
        'token_type': 'email_verification'
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token


def verify_email_token(token):
    """
    Verify a JWT email verification token

    Args:
        token: JWT token string

    Returns:
        dict: The decoded payload if valid

    Raises:
        jwt.ExpiredSignatureError: If token is expired
        jwt.InvalidTokenError: If token is invalid
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

        # Check if this is actually an email verification token
        if payload.get('token_type') != 'email_verification':
            raise jwt.InvalidTokenError("Invalid token type")

        return payload
    except jwt.ExpiredSignatureError:
        raise CoreAPIException(
            error_code=EC.AUTH_TOKEN_EXPIRED,
            message={"Email confirmation link has expired!"}
        )
    except jwt.InvalidTokenError:
        raise CoreAPIException(
            error_code=EC.RES_NOT_FOUND,
            message={"Invalid token!"}
        )