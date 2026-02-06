"""
Example: Using Authentication in Existing Routes

This file demonstrates how to protect existing endpoints with authentication
and role-based access control.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from app.middleware.auth import (
    require_customer,
    require_vendor,
    require_any_user,
    get_current_user,
    security
)

router = APIRouter(prefix="/api/examples", tags=["Examples"])


# Example 1: Customer-only endpoint
@router.post("/customer-indent")
async def create_customer_indent(
    indent_data: Dict[str, Any],
    user: Dict = Depends(require_customer)
):
    """
    Only customers can create indents
    The user object contains: userId, userType, emailId, companyCode, etc.
    """
    return {
        "message": "Indent created successfully",
        "createdBy": user['userId'],
        "userType": user['userType'],
        "companyCode": user['companyCode']
    }


# Example 2: Vendor-only endpoint
@router.post("/vendor-bid")
async def create_vendor_bid(
    bid_data: Dict[str, Any],
    user: Dict = Depends(require_vendor)
):
    """
    Only vendors can create bids
    """
    return {
        "message": "Bid created successfully",
        "createdBy": user['userId'],
        "userType": user['userType'],
        "vendorEmail": user['emailId']
    }


# Example 3: Any authenticated user
@router.get("/profile")
async def get_user_profile(user: Dict = Depends(require_any_user)):
    """
    Any authenticated user (Customer or Vendor) can access
    """
    return {
        "userId": user['userId'],
        "userType": user['userType'],
        "emailId": user['emailId'],
        "mobileNo": user['mobileNo'],
        "companyCode": user['companyCode'],
        "isActive": user['isActive']
    }


# Example 4: Manual token verification
@router.get("/manual-auth")
async def manual_auth_example(credentials = Depends(security)):
    """
    Manually verify token and get user data
    """
    user = await get_current_user(credentials)
    
    # Now you can use user data
    return {
        "message": "Authenticated successfully",
        "user": {
            "userId": user['userId'],
            "userType": user['userType']
        }
    }


# Example 5: Custom role checking
@router.get("/custom-role-check")
async def custom_role_check(user: Dict = Depends(require_any_user)):
    """
    Custom logic based on user role
    """
    if user['userType'] == 'Customer':
        # Customer-specific logic
        data = {"message": "Customer dashboard data"}
    elif user['userType'] == 'Vendor':
        # Vendor-specific logic
        data = {"message": "Vendor dashboard data"}
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unknown user type"
        )
    
    return data


# Example 6: Accessing user in route without dependency
@router.get("/optional-auth")
async def optional_auth(credentials = Depends(security)):
    """
    Optional authentication - handle both authenticated and unauthenticated
    """
    try:
        user = await get_current_user(credentials)
        return {
            "authenticated": True,
            "userId": user['userId']
        }
    except HTTPException:
        return {
            "authenticated": False,
            "message": "Public access"
        }


"""
How to integrate into existing routes:

1. Import the dependencies:
   from app.middleware.auth import require_customer, require_vendor, require_any_user

2. Add to your route:
   @router.post("/indents")
   async def create_indent(indent_data: IndentCreate, user = Depends(require_customer)):
       # user object contains all user data from Firestore
       indent_data.createdBy = user['userId']
       indent_data.companyCode = user['companyCode']
       # ... rest of your logic

3. The middleware will automatically:
   - Verify the token from Authorization header
   - Fetch user data from Firestore
   - Check if user is active
   - Validate user role
   - Reject if any check fails
"""
