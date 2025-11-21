# Backend API Documentation

---

## /users/register Endpoint
### Description
Registers a new user by creating a user account with the provided information.

### HTTP Method
POST

### Request Body
The request body should be in JSON format and include the following fields:

- **fullname (object):**
  - **firstname (string, required):** User's first name (minimum 3 characters).
  - **lastname (string, optional):** User's last name (minimum 3 characters).
- **email (string, required):** User's email address (must be a valid email).
- **password (string, required):** User's password (minimum 6 characters).

### Example Response
- **user (object):**
  - fullname (object)
  - firstname (string): User's first name
  - lastname (string): User's last name
  - email (string): User's email
  - password (string): User's password
- **token (String):** JWT Token

---

## /users/login Endpoint
### Description
Authenticates a user using their email and password, returning a JWT token upon successful login.

### HTTP Method
POST

### Endpoint
/users/login

### Request Body
- **email (string, required):** User's email (valid).
- **password (string, required):** User's password (min 6 chars).

### Example Response
- **user (object):**
  - fullname (object)
  - firstname (string)
  - lastname (string)
  - email (string)
  - password (string)
- **token (String):** JWT Token

---

## /users/profile Endpoint
### Description
Retrieves the profile information of the currently authenticated user.

### HTTP Method
GET

### Authentication
Requires JWT token →  
`Authorization: Bearer <token>`

### Example Response
- **user (object):**
  - fullname (object)
  - firstname (string)
  - lastname (string)
  - email (string)

---

## /users/logout Endpoint
### Description
Logout the current user and blacklist the token provided in cookie or headers.

### HTTP Method
GET

### Authentication
Requires valid JWT token in header or cookie.

### Example Response
- **user (object)**
  - fullname (object)
  - firstname (string)
  - lastname (string)
  - email (string)
  - password (string)
- **token (String):** JWT Token

---

## /captains/register Endpoint
### Description
Registers a new captain by creating a captain account with the provided information.

### HTTP Method
POST

### Request Body
- **fullname (object):**
  - firstname (string, required): min 3 chars  
  - lastname (string, optional)
- **email (string, required):** valid email  
- **password (string, required):** min 6 chars  
- **vehicle (object):**
  - color (string, required): min 3 chars  
  - plate (string, required): min 3 chars  
  - capacity (number, required): min 1  
  - vehicleType (string, required): 'car', 'motorcycle', or 'auto'

### Example Response
- **captain (object):**
  - fullname
  - firstname
  - lastname
  - email
  - password
  - vehicle:
    - color
    - plate
    - capacity
    - vehicleType
- **token (String):** JWT Token

---

## /captains/login Endpoint
### Description
Authenticates a captain using email and password, returning a JWT token.

### HTTP Method
POST

### Endpoint
/captains/login

### Request Body
- **email (string, required):** valid email
- **password (string, required):** min 6 chars

### Example Response
- **captain (object):**
  - fullname
  - firstname
  - lastname
  - email
  - password
  - vehicle:
    - color
    - plate
    - capacity
    - vehicleType
- **token (String)**

---

## /captains/profile Endpoint
### Description
Retrieves the profile information of the currently authenticated captain.

### HTTP Method
GET

### Authentication
`Authorization: Bearer <token>`

### Example Response
- **captain (object):**
  - fullname
  - firstname
  - lastname
  - email
  - vehicle (object):
    - color
    - plate
    - capacity
    - vehicleType

---

## /captains/logout Endpoint
### Description
Logout the current captain and blacklist the token.

### HTTP Method
GET

### Authentication
Requires JWT token in header or cookie.

### Example Response
- **message (string):** Logout successfully.

---

## /maps/get-coordinates Endpoint
### Description
Retrieves the coordinates (latitude and longitude) for a given address.

### HTTP Method
GET

### Request Parameters
- **address (string, required)**

### Example Request
