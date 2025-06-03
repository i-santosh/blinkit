import base64
import time
import uuid


def generate_unique_id():
    # Generate UUID
    random_uuid = uuid.uuid4().bytes

    # Get current timestamp in seconds
    timestamp = int(time.time())

    # Combine UUID and timestamp
    combined = random_uuid + timestamp.to_bytes(8, 'big')

    # Base64 encode the combined bytes, making it URL-safe
    encoded_str = base64.urlsafe_b64encode(combined).decode('utf-8')

    # Return the string is exactly 11 characters long
    return encoded_str[:11]

