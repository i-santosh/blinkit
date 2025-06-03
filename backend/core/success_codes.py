from enum import Enum, unique

@unique
class SuccessCodes(Enum):
    """
    Centralized and comprehensive success code management with detailed success outcomes.
   
    Success Code Structure:
    - Prefix indicates success category
    - Middle section describes specific success type
    - Suffix provides unique identifier
   
    Success Code Prefix Convention:
    - AUTH: Authentication successes
    - CRE: Creation successes
    - UPD: Update successes
    - DEL: Deletion successes
    - PRO: Process successes
    - SYS: System operations
    - REQ: Request successes
    """
   
    # Authentication Successes
    AUTH_LOGIN_SUCCESS = 'AUTH_USER_AUTHENTICATED'
    AUTH_LOGOUT_SUCCESS = 'AUTH_USER_LOGGED_OUT'
    AUTH_REGISTRATION_COMPLETE = 'AUTH_USER_REGISTRATION_SUCCESSFUL'
    AUTH_PASSWORD_RESET = 'AUTH_PASSWORD_RESET_CONFIRMED'
    AUTH_MFA_VERIFIED = 'AUTH_MULTI_FACTOR_VALIDATED'
   
    # Creation Successes
    CRE_RESOURCE_CREATED = 'CRE_RESOURCE_SUCCESSFULLY_ADDED'
    CRE_ACCOUNT_CREATED = 'CRE_USER_ACCOUNT_ESTABLISHED'
    CRE_PROFILE_CREATED = 'CRE_USER_PROFILE_GENERATED'
   
    # Update Successes
    UPD_RESOURCE_MODIFIED = 'UPD_RESOURCE_SUCCESSFULLY_UPDATED'
    UPD_PROFILE_UPDATED = 'UPD_USER_PROFILE_MODIFIED'
    UPD_SETTINGS_APPLIED = 'UPD_USER_SETTINGS_CONFIGURED'
   
    # Deletion Successes
    DEL_RESOURCE_REMOVED = 'DEL_RESOURCE_SUCCESSFULLY_DELETED'
    DEL_ACCOUNT_CLOSED = 'DEL_USER_ACCOUNT_TERMINATED'
    DEL_TEMPORARY_DATA = 'DEL_TEMPORARY_DATA_CLEARED'
   
    # Process Successes
    PRO_OPERATION_COMPLETE = 'PRO_PROCESS_SUCCESSFULLY_EXECUTED'
    PRO_BATCH_PROCESSED = 'PRO_BATCH_OPERATION_COMPLETED'
    PRO_VALIDATION_PASSED = 'PRO_INPUT_VALIDATION_SUCCESSFUL'
   
    # System Successes
    SYS_STARTUP_COMPLETE = 'SYS_APPLICATION_INITIALIZED'
    SYS_BACKUP_SUCCESS = 'SYS_DATA_BACKUP_COMPLETED'
    SYS_CONFIG_LOADED = 'SYS_CONFIGURATION_SUCCESSFULLY_APPLIED'
   
    # Request Successes
    REQ_PROCESSED = 'REQ_REQUEST_SUCCESSFULLY_HANDLED'
    REQ_DATA_RETRIEVED = 'REQ_DATA_FETCH_COMPLETED'
    REQ_ACTION_PERMITTED = 'REQ_ACTION_AUTHORIZATION_GRANTED'


