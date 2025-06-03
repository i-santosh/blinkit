import jwt
from datetime import datetime, timedelta, timezone

# Calculate max_age and expires dynamically
def calculate_jwt_expiry(token):
    """
    Decode the token without verifying signature for extracting
    claims only

    Return `max_age`, `expiry_datetime`
    """
    print('token:', token)
    decoded_token = jwt.decode(
        token, 
        options={"verify_signature": False},
        algorithms=["HS256"]
    )
    print('decoded_token:', decoded_token)

    # Extract the expiry timestamp
    expiry_timestamp = decoded_token['exp']

    # Convert expiry timestamp to datetime
    expiry_datetime = datetime.fromtimestamp(
        expiry_timestamp, 
        tz=timezone.utc
    )

    # Calculate max_age (in seconds) and return expiry datetime
    now = datetime.now(timezone.utc)
    max_age = (expiry_datetime - now).total_seconds()

    return max_age, expiry_datetime
