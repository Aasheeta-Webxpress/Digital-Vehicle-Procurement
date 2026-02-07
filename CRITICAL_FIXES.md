# 🚨 CRITICAL FIXES - Immediate Action Required

## Issues Causing Login/Redirect/White Screen Problems

This document provides **step-by-step fixes** for the critical issues identified in the code review.

---

## 🔴 FIX #1: API URL Inconsistency (30 minutes)

### Problem
Authentication uses different API base URL than other services, causing 404 errors.

### Files to Fix
1. `components/AuthContext.tsx`
2. `services.ts`
3. Create `.env` file

### Step-by-Step Fix

#### Step 1: Create Environment File
Create `.env` in project root:

```env
# Frontend Environment Variables
VITE_API_URL=http://143.110.191.22:8020/api/v1
VITE_API_BASE=http://143.110.191.22:8020
```

#### Step 2: Update AuthContext.tsx

**Replace lines 55 and 94:**

```typescript
// ❌ BEFORE (Line 55, 94)
const API_BASE_URL = 'http://143.110.191.22:8020/api';

// ✅ AFTER
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const API_AUTH_PATH = '/api/auth';
```

**Update login function (Line 58):**

```typescript
// ✅ CORRECT
const response = await fetch(`${API_BASE_URL}${API_AUTH_PATH}/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: email,
    password: password,
  }),
});
```

**Update register function (Line 97):**

```typescript
// ✅ CORRECT
const response = await fetch(`${API_BASE_URL}${API_AUTH_PATH}/register`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: email,
    password: password,
    mobileNo: mobileNo,
    userType: userType,
    companyCode: companyCode,
  }),
});
```

#### Step 3: Update services.ts

**Replace line 15:**

```typescript
// ❌ BEFORE
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://143.110.191.22:8020/api/v1';

// ✅ AFTER
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
```

---

## 🔴 FIX #2: Add Error Boundary (1 hour)

### Problem
Uncaught errors cause white screen with no feedback.

### Step-by-Step Fix

#### Step 1: Create ErrorBoundary Component

Create new file: `components/ErrorBoundary.tsx`

```typescript
import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // TODO: Send to error tracking service (Sentry, etc.)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-red-100">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6 mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-black text-gray-900 mb-2 text-center">
              Something Went Wrong
            </h1>
            
            <p className="text-sm text-gray-600 mb-6 text-center">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-red-900 mb-2">Error Details:</p>
                <p className="text-xs text-red-700 font-mono break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            <button
              onClick={this.handleReset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### Step 2: Update App.tsx

**Wrap the entire app:**

```typescript
// Add import at top
import ErrorBoundary from './components/ErrorBoundary';

// Update App component (Line 318-324)
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};
```

---

## 🔴 FIX #3: Fix Authentication Race Condition (1 hour)

### Problem
Components render before auth state is ready, causing white screens and redirects.

### Step-by-Step Fix

#### Update App.tsx

**Replace the authentication check section (Lines 43-65):**

```typescript
// ❌ BEFORE
useEffect(() => {
  if (user) {
    setCurrentUser({
      role: user.userType === 'Customer' ? UserRole.CUSTOMER : UserRole.VENDOR,
      id: user.userId,
      name: user.emailId.split('@')[0]
    });
  }
}, [user]);

if (authLoading) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  );
}

if (!isAuthenticated) {
  return <LoginPage />;
}

// ✅ AFTER
useEffect(() => {
  if (user) {
    setCurrentUser({
      role: user.userType === 'Customer' ? UserRole.CUSTOMER : UserRole.VENDOR,
      id: user.userId,
      name: user.emailId.split('@')[0]
    });
  }
}, [user]);

// Show loading screen while auth is initializing
if (authLoading) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

// Show login page if not authenticated
if (!isAuthenticated || !user) {
  return <LoginPage />;
}

// Don't render main app until user data is fully loaded
if (!currentUser.id || currentUser.id === 'C1') {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-gray-500">Initializing user session...</p>
      </div>
    </div>
  );
}
```

---

## 🔴 FIX #4: Add Proper Error Handling (1 hour)

### Problem
Network errors and API failures not properly handled.

### Step-by-Step Fix

#### Update AuthContext.tsx

**Improve error handling in login function (Lines 53-89):**

```typescript
const login = async (email: string, password: string) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    const loginUrl = `${API_BASE_URL}/api/auth/login`;
    
    console.log('Attempting login to:', loginUrl);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });

    console.log('Login response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    console.log('Login response data:', data);

    if (data.success && data.user && data.token) {
      // Store token and user info
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      
      console.log('Login successful, user:', data.user);
    } else {
      throw new Error(data.message || 'Login failed: Invalid response format');
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Provide user-friendly error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }
    
    throw error;
  }
};
```

#### Update services.ts

**Add error handling to all service methods:**

```typescript
static async getIndents(): Promise<Indent[]> {
  if (USE_MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getStoredData().indents;
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/indents`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch indents`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching indents:', error);
      
      // Return empty array instead of throwing to prevent white screen
      // TODO: Show error notification to user
      return [];
    }
  }
}
```

---

## 🔴 FIX #5: Remove Duplicate User State (30 minutes)

### Problem
Two sources of truth for user data causing synchronization issues.

### Step-by-Step Fix

#### Update App.tsx

**Remove duplicate currentUser state and use AuthContext directly:**

```typescript
// ❌ REMOVE THESE LINES (22-26)
const [currentUser, setCurrentUser] = useState<{ role: UserRole; id: string; name: string }>({
  role: UserRole.CUSTOMER,
  id: 'C1',
  name: 'ABBL Admin'
});

// ❌ REMOVE THIS EFFECT (44-52)
useEffect(() => {
  if (user) {
    setCurrentUser({
      role: user.userType === 'Customer' ? UserRole.CUSTOMER : UserRole.VENDOR,
      id: user.userId,
      name: user.emailId.split('@')[0]
    });
  }
}, [user]);

// ✅ ADD THIS COMPUTED VALUE INSTEAD
const currentUser = useMemo(() => {
  if (!user) {
    return {
      role: UserRole.CUSTOMER,
      id: '',
      name: ''
    };
  }
  
  return {
    role: user.userType === 'Customer' ? UserRole.CUSTOMER : UserRole.VENDOR,
    id: user.userId,
    name: user.emailId.split('@')[0]
  };
}, [user]);
```

**Update handleRoleSwitch function (Lines 192-200):**

```typescript
// ❌ REMOVE THIS FUNCTION - Role switching should not be allowed in production
// Users should only see their own role based on their account

// ✅ If you need role switching for testing, do it through a separate admin panel
```

---

## 🔴 FIX #6: Fix CORS Configuration (15 minutes)

### Problem
Wildcard CORS allows any origin, security vulnerability.

### Step-by-Step Fix

#### Update backend/app/config.py

**Replace line 23:**

```python
# ❌ BEFORE
cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:3020,*"

# ✅ AFTER
cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:3020,https://your-production-domain.com"
```

#### Create backend/.env file

```env
# Backend Environment Variables
FIREBASE_PROJECT_ID=controltower-1099
API_HOST=0.0.0.0
API_PORT=8020
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-production-domain.com
SECRET_KEY=your-super-secret-key-change-this-in-production
ENVIRONMENT=development
DEBUG=True
```

#### Update backend/app/config.py to use environment variables

```python
class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Firebase Configuration
    firebase_credentials_path: str = "./serviceAccountKey.json"
    firebase_project_id: str = "controltower-1099"
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8020
    api_reload: bool = True
    
    # CORS Configuration - NO WILDCARD
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # Environment
    environment: str = "development"
    debug: bool = True
    
    # JWT Authentication - MUST BE CHANGED IN PRODUCTION
    secret_key: str = Field(
        default="tvs-procurement-secret-key-change-in-production",
        description="JWT secret key - MUST be changed in production"
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    
    class Config:
        env_file = ".env"
        case_sensitive = False
```

---

## 🔴 FIX #7: Add Request Cancellation (30 minutes)

### Problem
Fetch requests not cancelled on component unmount, causing memory leaks.

### Step-by-Step Fix

#### Update AuthContext.tsx

**Add AbortController to login and register:**

```typescript
const login = async (email: string, password: string) => {
  const abortController = new AbortController();
  
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    const loginUrl = `${API_BASE_URL}/api/auth/login`;

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
      signal: abortController.signal, // ✅ ADD THIS
    });

    // ... rest of the code
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Login request cancelled');
      return;
    }
    console.error('Login error:', error);
    throw error;
  }
};
```

#### Update services.ts

**Add AbortController to all fetch calls:**

```typescript
static async getIndents(): Promise<Indent[]> {
  if (USE_MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getStoredData().indents;
  } else {
    const abortController = new AbortController();
    
    try {
      const response = await fetch(`${API_BASE_URL}/indents`, {
        headers: this.getAuthHeaders(),
        signal: abortController.signal // ✅ ADD THIS
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
        return [];
      }
      console.error('Error fetching indents:', error);
      return [];
    }
  }
}
```

---

## ✅ Testing Your Fixes

### Step 1: Clear Browser Storage
```javascript
// Open browser console and run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 2: Restart Development Servers

**Frontend:**
```bash
npm run dev
```

**Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8020
```

### Step 3: Test Login Flow

1. Open http://localhost:5173
2. Open browser DevTools (F12) → Console tab
3. Try to login
4. Check console for any errors
5. Verify you're redirected to dashboard

### Step 4: Test Error Handling

1. Stop the backend server
2. Try to login
3. Should see user-friendly error message (not white screen)
4. Restart backend and try again

---

## 🎯 Expected Results After Fixes

### ✅ Login Should Work
- No 404 errors
- Proper error messages if credentials are wrong
- Smooth redirect to dashboard after successful login

### ✅ No More White Screens
- Error boundary catches all errors
- User-friendly error messages
- Reload button to recover

### ✅ No More Redirect Issues
- Single source of truth for user state
- Proper loading states
- No race conditions

### ✅ Better Security
- No wildcard CORS
- Environment variables for secrets
- Proper error handling

---

## 📞 If Issues Persist

### Check These Common Problems:

1. **Still getting 404 on login?**
   - Verify backend is running on port 8020
   - Check `.env` file exists and has correct URL
   - Check browser console for actual URL being called

2. **Still seeing white screen?**
   - Check browser console for errors
   - Verify ErrorBoundary is imported correctly
   - Check if error boundary is rendering

3. **Login succeeds but redirects to login again?**
   - Check localStorage has `auth_token` and `auth_user`
   - Verify `isAuthenticated` is true in AuthContext
   - Check for race conditions in useEffect

4. **CORS errors?**
   - Verify backend CORS settings
   - Check frontend is calling correct URL
   - Verify both frontend and backend are running

---

## 🚀 Next Steps After Critical Fixes

Once these critical fixes are working:

1. Add proper logging/monitoring
2. Implement rate limiting
3. Add input sanitization
4. Implement token refresh
5. Add comprehensive tests
6. Optimize performance

---

**Last Updated**: February 7, 2026  
**Estimated Time to Complete All Fixes**: 4-5 hours
