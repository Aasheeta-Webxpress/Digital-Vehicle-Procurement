"""
Test script for Firebase Authentication endpoints
Run this after starting the server to verify the authentication flow
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_registration():
    """Test user registration"""
    print("\n" + "="*60)
    print("Testing User Registration")
    print("="*60)
    
    payload = {
        "username": "testuser@example.com",
        "password": "TestPass@123",
        "userType": "Customer",
        "mobileNo": "9876543210",
        "companyCode": 10065
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return response.json()


def test_login():
    """Test user login"""
    print("\n" + "="*60)
    print("Testing User Login")
    print("="*60)
    
    payload = {
        "username": "testuser@example.com",
        "password": "TestPass@123"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        return response.json().get('token')
    return None


def test_get_current_user(token):
    """Test getting current user info"""
    print("\n" + "="*60)
    print("Testing Get Current User")
    print("="*60)
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_verify_token(token):
    """Test token verification"""
    print("\n" + "="*60)
    print("Testing Token Verification")
    print("="*60)
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/verify-token", headers=headers)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_vendor_registration():
    """Test vendor registration"""
    print("\n" + "="*60)
    print("Testing Vendor Registration")
    print("="*60)
    
    payload = {
        "username": "vendor@example.com",
        "password": "VendorPass@456",
        "userType": "Vendor",
        "mobileNo": "8765432109",
        "companyCode": 10065
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_invalid_password():
    """Test registration with weak password"""
    print("\n" + "="*60)
    print("Testing Invalid Password (Should Fail)")
    print("="*60)
    
    payload = {
        "username": "weak@example.com",
        "password": "weak",
        "userType": "Customer",
        "mobileNo": "7654321098",
        "companyCode": 10065
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def main():
    """Run all tests"""
    print("\n" + "🔥"*30)
    print("Firebase Authentication Test Suite")
    print("🔥"*30)
    
    try:
        # Test 1: Invalid password
        test_invalid_password()
        
        # Test 2: Register customer
        test_registration()
        
        # Test 3: Register vendor
        test_vendor_registration()
        
        # Test 4: Login
        token = test_login()
        
        if token:
            # Test 5: Get current user (requires Firebase Client SDK to exchange token)
            print("\n⚠️  Note: The following tests require exchanging the custom token")
            print("    for an ID token using Firebase Client SDK in production.")
            print("    For testing, you may need to implement token exchange.")
            
            # test_get_current_user(token)
            # test_verify_token(token)
        
        print("\n" + "✅"*30)
        print("Test Suite Completed!")
        print("✅"*30 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to server")
        print("   Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")


if __name__ == "__main__":
    main()
