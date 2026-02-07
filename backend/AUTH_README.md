# Firebase Authentication & User Management

## Overview

This backend implements a complete Firebase Authentication system with Firestore user management for the Digital Vehicle Procurement platform.

## Features

✅ **User Registration** - Create users with Firebase Auth + Firestore profile  
✅ **User Login** - Authenticate with email/password  
✅ **Token-based Auth** - JWT tokens with custom claims  
✅ **Role-based Access** - Customer/Vendor role separation  
✅ **Active Status Check** - Only active users can login  
✅ **Secure Password** - Firebase Auth handles password hashing  

## API Endpoints

### 1. Register User

**POST** `/api/auth/register`

```json
{
  "username": "user@example.com",
  "password": "SecurePass@123",
  "userType": "Customer",
  "mobileNo": "9876543210",
  "companyCode": 10065
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "USR0001",
    "email": "user@example.com"
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character (@$!%*?&#)

### 2. Login User

**POST** `/api/auth/login`

```json
{
  "username": "user@example.com",
  "password": "SecurePass@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "userId": "USR0001",
    "userType": "Customer",
    "mobileNo": "9876543210",
    "emailId": "user@example.com",
    "isActive": true,
    "companyCode": 10065,
    "userStatus": "Permanent",
    "entryDate": "2023-09-21T10:13:49.328Z"
  },
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Current User

**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "USR0001",
    "emailId": "user@example.com",
    "userType": "Customer",
    "mobileNo": "9876543210",
    "companyCode": 10065,
    "userStatus": "Permanent",
    "isActive": true
  }
}
```

### 4. Verify Token

**POST** `/api/auth/verify-token`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "uid": "firebase-uid-here",
  "userType": "Customer",
  "userId": "USR0001"
}
```

## Firestore Schema

### Collection: `user_master`

```javascript
{
  "_id": "10065-USR0001",           // Composite: companyCode-userId
  "userId": "USR0001",              // Auto-generated sequential ID
  "userStatus": "Permanent",        // User status
  "userType": "Customer",           // "Customer" OR "Vendor"
  "mobileNo": "9876543210",         // 10-digit mobile
  "emailId": "user@example.com",    // Email (username)
  "isActive": true,                 // Active status flag
  "entryDate": "2023-09-21T10:13:49.328Z",
  "companyCode": 10065,             // Company identifier
  "firebaseUid": "firebase-uid"     // Firebase Auth UID mapping
}
```

## Authentication Flow

### Registration Flow

1. **Client** sends registration data to `/api/auth/register`
2. **Backend** validates password strength and mobile format
3. **Firebase Auth** creates user account (email + password)
4. **Backend** generates sequential `userId` (e.g., USR0001)
5. **Firestore** saves user profile in `user_master` collection
6. **Response** returns success with userId

### Login Flow

1. **Client** sends credentials to `/api/auth/login`
2. **Firebase Auth** verifies email exists
3. **Backend** fetches user from Firestore by `firebaseUid`
4. **Backend** checks `isActive = true`
5. **Firebase Auth** generates custom token with claims:
   - `userType` (Customer/Vendor)
   - `userId`
   - `companyCode`
6. **Response** returns user data + custom token

### Protected Route Access

1. **Client** includes token in `Authorization: Bearer <token>` header
2. **Middleware** verifies token with Firebase Auth
3. **Middleware** fetches user from Firestore
4. **Middleware** checks `isActive = true`
5. **Middleware** validates user role (if role-based endpoint)
6. **Request** proceeds if authorized

## Role-Based Access Control

### Using Role Dependencies

```python
from app.middleware.auth import require_customer, require_vendor, require_any_user

# Customer-only endpoint
@router.get("/customer-only")
async def customer_endpoint(user = Depends(require_customer)):
    return {"message": "Customer access granted"}

# Vendor-only endpoint
@router.get("/vendor-only")
async def vendor_endpoint(user = Depends(require_vendor)):
    return {"message": "Vendor access granted"}

# Any authenticated user
@router.get("/protected")
async def protected_endpoint(user = Depends(require_any_user)):
    return {"message": "Authenticated user access"}
```

## Security Features

### 🔐 Password Security
- Passwords managed by Firebase Auth (bcrypt hashing)
- Never stored in Firestore
- Strong password validation enforced

### 🛡️ Token Security
- JWT tokens with expiration
- Custom claims for role-based access
- Token verification on every request

### 🔒 Firestore Security
- Security rules based on authenticated UID
- Role-based read/write permissions
- Active status validation

### 🚫 Access Control
- Only active users can login
- Role-based endpoint protection
- User can only access their own data

## Firestore Security Rules

Deploy the security rules:

```bash
firebase deploy --only firestore:rules
```

The rules enforce:
- Authenticated access only
- Users can read/update their own profile
- Role-based access to collections
- Active status validation

## Testing

### Test Registration

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "Test@1234",
    "userType": "Customer",
    "mobileNo": "9876543210",
    "companyCode": 10065
  }'
```

### Test Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "Test@1234"
  }'
```

### Test Protected Endpoint

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <your-token-here>"
```

## Error Handling

### Registration Errors
- `400` - Invalid input (weak password, invalid mobile)
- `400` - Email already exists

### Login Errors
- `401` - Invalid credentials
- `401` - User not found
- `403` - User account deactivated

### Protected Route Errors
- `401` - Invalid/expired token
- `403` - Insufficient permissions (wrong role)
- `404` - User not found

## Environment Setup

Ensure your `.env` file has:

```env
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=controltower-1099
```

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python -m app.main
```

## Next Steps

1. **Frontend Integration**: Use Firebase Client SDK to exchange custom token for ID token
2. **Email Verification**: Enable email verification in Firebase Console
3. **Password Reset**: Implement password reset flow
4. **Admin Panel**: Create admin endpoints for user management
5. **Audit Logs**: Track user login/registration events

## Notes

⚠️ **Important**: The custom token returned from login must be exchanged for an ID token using Firebase Client SDK before making authenticated requests.

📝 **User ID Generation**: Sequential IDs are generated per company (USR0001, USR0002, etc.)

🔄 **Token Refresh**: Implement token refresh logic in frontend for long sessions
