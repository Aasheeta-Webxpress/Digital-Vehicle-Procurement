# 🎯 QUICK START - Test Your Authentication NOW!

## ✅ YES, AUTH IS READY TO GO LIVE!

Your Firebase Authentication is **fully deployed** and working at:
- **Backend:** http://143.110.191.22:8020
- **API Docs:** http://143.110.191.22:8020/docs

---

## 🚀 Test in 3 Steps (2 Minutes)

### Step 1: Open API Documentation

**In your browser, go to:**
```
http://143.110.191.22:8020/docs
```

You'll see the **Swagger UI** with all endpoints.

### Step 2: Register a Customer

1. Find **`POST /api/auth/register`** endpoint
2. Click **"Try it out"**
3. Fill in this data:

```json
{
  "username": "customer@test.com",
  "password": "Customer@123",
  "userType": "Customer",
  "mobileNo": "9876543210",
  "companyCode": 10065
}
```

4. Click **"Execute"**
5. You'll get response: `"userId": "USR0001"`

### Step 3: Register a Vendor

Same process, but use:

```json
{
  "username": "vendor@test.com",
  "password": "Vendor@456",
  "userType": "Vendor",
  "mobileNo": "8765432109",
  "companyCode": 10065
}
```

Response: `"userId": "USR0002"`

---

## 📍 Where is Data Stored?

### Firebase Firestore Database

**Project:** controltower-1099  
**Database:** digitalvehicleprocurement6226  
**Collection:** `user_master`

**To view your data:**

1. Go to: https://console.firebase.google.com
2. Select project: **controltower-1099**
3. Click **Firestore Database** (left menu)
4. Select database: **digitalvehicleprocurement6226**
5. Click collection: **user_master**

You'll see documents like:
- `10065-USR0001` (Customer)
- `10065-USR0002` (Vendor)
- `10065-USR0003` (next user)

Each document contains:
```javascript
{
  "_id": "10065-USR0001",
  "userId": "USR0001",
  "emailId": "customer@test.com",
  "userType": "Customer",      // or "Vendor"
  "mobileNo": "9876543210",
  "isActive": true,
  "companyCode": 10065,
  "firebaseUid": "abc123...",
  "entryDate": "2023-09-21..."
}
```

---

## 🔐 Both Customer & Vendor Can Register/Login

**YES!** When registering, the user chooses their type:

### Customer Registration
```json
{
  "userType": "Customer"
}
```

### Vendor Registration
```json
{
  "userType": "Vendor"
}
```

**Both can login the same way:**
```json
{
  "username": "their-email@example.com",
  "password": "TheirPassword@123"
}
```

The system identifies their role from the `userType` field!

---

## 📋 All Available Endpoints

| Endpoint | What It Does |
|----------|--------------|
| `POST /api/auth/register` | Register Customer or Vendor |
| `POST /api/auth/login` | Login (both types) |
| `GET /api/auth/me` | Get current user info |
| `POST /api/auth/verify-token` | Check if token valid |
| `GET /health` | Check backend status |
| `GET /docs` | API documentation |

---

## ✅ Final Checklist

- [ ] Open http://143.110.191.22:8020/docs
- [ ] Register a Customer user
- [ ] Register a Vendor user  
- [ ] Login with both accounts
- [ ] Check Firestore to see the data
- [ ] Integrate with your frontend

**YOU CAN GO LIVE NOW!** 🎉
