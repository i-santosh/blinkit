# BOSS Backend API Documentation

Welcome to the BOSS Backend API documentation. This document provides details on how to interact with the BOSS backend services. Below, you'll find information on the available endpoints, request formats, and expected responses.

## Base URL
All endpoints are relative to the base URL of the BOSS backend service. Ensure you have the correct base URL configured in your application.


# BOSS Backend Success Codes Structure

This section provides an overview of the success codes used in the BOSS backend. Success codes are structured to provide clear information about the type and category of successful operations.

## Success Code Structure

Success codes are organized to provide meaningful information about the success category and type:

- **Prefix:** Indicates the success category (e.g., `AUTH` for authentication successes).
- **Middle Section:** Describes the specific success type (e.g., `LOGIN_SUCCESS`).
- **Suffix:** Provides a unique identifier for the success.

### Success Code Prefix Convention

| Prefix | Category                     |
|--------|------------------------------|
| AUTH   | Authentication operations    |
| CRE    | Creation operations          |
| UPD    | Update operations            |
| DEL    | Deletion operations          |
| PRO    | Process operations           |
| SYS    | System operations            |
| REQ    | Request operations           |

---

## Success Codes and Descriptions

Below is a list of success codes along with their descriptions.

### Authentication Successes (`AUTH`)

| Success Code                     | Description                                      |
|----------------------------------|--------------------------------------------------|
| `AUTH_USER_AUTHENTICATED`        | User successfully logged in.                     |
| `AUTH_USER_LOGGED_OUT`           | User successfully logged out.                    |
| `AUTH_USER_REGISTRATION_SUCCESSFUL` | User registration completed successfully.     |
| `AUTH_PASSWORD_RESET_CONFIRMED`  | Password reset completed successfully.          |
| `AUTH_MULTI_FACTOR_VALIDATED`    | Multi-factor authentication verified successfully. |

---

### Creation Successes (`CRE`)

| Success Code                     | Description                                      |
|----------------------------------|--------------------------------------------------|
| `CRE_RESOURCE_SUCCESSFULLY_ADDED` | Resource created successfully.                  |
| `CRE_USER_ACCOUNT_ESTABLISHED`   | User account created successfully.              |
| `CRE_USER_PROFILE_GENERATED`     | User profile created successfully.              |

---

### Update Successes (`UPD`)

| Success Code                     | Description                                      |
|----------------------------------|--------------------------------------------------|
| `UPD_RESOURCE_SUCCESSFULLY_UPDATED` | Resource updated successfully.                 |
| `UPD_USER_PROFILE_MODIFIED`      | User profile updated successfully.              |
| `UPD_USER_SETTINGS_CONFIGURED`   | User settings applied successfully.             |

---

### Deletion Successes (`DEL`)

| Success Code                     | Description                                      |
|----------------------------------|--------------------------------------------------|
| `DEL_RESOURCE_SUCCESSFULLY_DELETED` | Resource deleted successfully.                 |
| `DEL_USER_ACCOUNT_TERMINATED`    | User account closed successfully.               |
| `DEL_TEMPORARY_DATA_CLEARED`     | Temporary data cleared successfully.            |

---

### Process Successes (`PRO`)

| Success Code                     | Description                                      |
|----------------------------------|--------------------------------------------------|
| `PRO_PROCESS_SUCCESSFULLY_EXECUTED` | Process completed successfully.                |
| `PRO_BATCH_OPERATION_COMPLETED`  | Batch operation completed successfully.         |
| `PRO_INPUT_VALIDATION_SUCCESSFUL` | Input validation passed successfully.          |

---

### System Successes (`SYS`)

| Success Code                     | Description                                      |
|----------------------------------|--------------------------------------------------|
| `SYS_APPLICATION_INITIALIZED`    | System startup completed successfully.          |
| `SYS_DATA_BACKUP_COMPLETED`      | Data backup completed successfully.             |
| `SYS_CONFIGURATION_SUCCESSFULLY_APPLIED` | System configuration applied successfully. |

---

### Request Successes (`REQ`)

| Success Code                     | Description                                      |
|----------------------------------|--------------------------------------------------|
| `REQ_REQUEST_SUCCESSFULLY_HANDLED` | Request processed successfully.                |
| `REQ_DATA_FETCH_COMPLETED`       | Data retrieved successfully.                    |
| `REQ_ACTION_AUTHORIZATION_GRANTED` | Action authorized successfully.                |

---

# BOSS Backend Error Handling Structure

This section provides an overview of the error handling mechanism in the BOSS backend. The system uses a centralized error code management system to ensure consistent and detailed error responses.

## Error Code Structure

Error codes are structured to provide clear information about the type and category of the error:

- **Prefix:** Indicates the error category (e.g., `AUTH` for authentication errors).
- **Middle Section:** Describes the specific error type (e.g., `INVALID_CREDENTIALS`).
- **Suffix:** Provides a unique identifier for the error.

### Error Code Prefix Convention

| Prefix | Category                     |
|--------|------------------------------|
| AUTH   | Authentication errors        |
| VAL    | Validation errors            |
| PERM   | Permission errors            |
| RES    | Resource errors              |
| SYS    | System errors                |
| REQ    | Request errors               |
| CRIT   | Critical/Unrecoverable errors|

---

## Error Codes and Details

Below is a list of error codes along with their details, including the error message, HTTP status code, and recommended action.

### Authentication Errors (`AUTH`)

| Error Code                | Message                                                                 | HTTP Status Code | Recommended Action                          |
|---------------------------|-------------------------------------------------------------------------|------------------|---------------------------------------------|
| `AUTH_INVALID_CREDENTIALS`| Login failed. Invalid username or password.                             | 401              | Verify credentials and try again            |
| `AUTH_TOKEN_EXPIRED`      | Authentication session has expired.                                     | 401              | Re-authenticate and obtain a new token      |
| `AUTH_MFA_REQUIRED`       | Multi-factor authentication is required.                                | 403              | Complete multi-factor authentication        |
| `AUTH_ACCOUNT_LOCKED`     | Account has been temporarily locked due to multiple failed attempts.    | 403              | Reset password or contact support           |

---

### Validation Errors (`VAL`)

| Error Code            | Message                                          | HTTP Status Code | Recommended Action                |
|-----------------------|--------------------------------------------------|------------------|-----------------------------------|
| `VAL_INVALID_FORMAT`  | Input does not match the required format.        | 400              | Check input format and resubmit   |
| `VAL_FIELD_REQUIRED`  | Required field is missing.                       | 400              | Provide all mandatory fields      |
| `VAL_LENGTH_EXCEEDED` | Input length exceeds maximum allowed limit.      | 400              | Reduce input length to meet requirements |

---

### Permission Errors (`PERM`)

| Error Code                | Message                                          | HTTP Status Code | Recommended Action                |
|---------------------------|--------------------------------------------------|------------------|-----------------------------------|
| `PERM_INSUFFICIENT_ACCESS`| Insufficient permissions to perform this action. | 403              | Request appropriate access level  |
| `PERM_ACTION_FORBIDDEN`   | Permission denied to perform this action.        | 403              | Request appropriate access level  |

---

### Resource Errors (`RES`)

| Error Code            | Message                                          | HTTP Status Code | Recommended Action                |
|-----------------------|--------------------------------------------------|------------------|-----------------------------------|
| `RES_NOT_FOUND`       | Requested resource does not exist.               | 404              | Verify resource identifier and try again |
| `RES_ALREADY_EXISTS`  | Requested resource already exists.               | 409              | Verify resource identifier and try again |
| `RES_DELETED`         | Requested resource doesn't exist.                | 404              | Verify resource identifier and try again |

---

### System Errors (`SYS`)

| Error Code                        | Message                                          | HTTP Status Code | Recommended Action                |
|-----------------------------------|--------------------------------------------------|------------------|-----------------------------------|
| `SYS_INTERNAL_ERROR`              | An unexpected internal system error occurred.    | 500              | Contact system administrator      |
| `SYS_DATABASE_CONN`               | Unable to establish database connection.         | 500              | Retry after a short wait or contact support |

---

### Request Errors (`REQ`)

| Error Code                | Message                                          | HTTP Status Code | Recommended Action                |
|---------------------------|--------------------------------------------------|------------------|-----------------------------------|
| `REQ_PARSE_FAILED`        | Couldn't load the Request.                       | 400              | Wait and retry after specified cooldown |
| `REQ_RATE_LIMIT_EXCEEDED` | Too many requests. Rate limit exceeded.          | 429              | Wait and retry after specified cooldown |
| `REQ_METHOD_NOT_ALLOWED`  | Method not allowed.                              | 405              | -                                 |

---

### Critical Errors (`CRIT`)

| Error Code                | Message                                          | HTTP Status Code | Recommended Action                |
|---------------------------|--------------------------------------------------|------------------|-----------------------------------|
| `CRIT_DATA_CORRUPTION`    | Critical data integrity issue detected.          | 500              | Contact system administrator      |


---

# API Endpoints

## 1. Accounts Endpoints

### 1.1 User Signup

Create a new user account.

- **URL:** `/api/v1/accounts/signup/`
- **Method:** `POST`
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "full_name": string,
  "email": string,
  "password": string,
  "country": string
}
```

- **full_name:** The full name of the user.
- **email:** The email address of the user. This will be used for login.
- **password:** The password for the user account.
- **country:** The country of residence for the user.


---

### 1.2 User Signin

Sign in a user into account.

- **URL:** `/api/v1/accounts/signin/`
- **Method:** `POST`
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "email": string,
  "password": string,
}
```

- **email:** The registered email of the user.
- **password:** The password for the user account.

