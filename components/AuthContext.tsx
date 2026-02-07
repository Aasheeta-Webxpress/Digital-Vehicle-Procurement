import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  userId: string;
  userType: 'Customer' | 'Vendor';
  emailId: string;
  mobileNo: string;
  companyCode: number;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, mobileNo: string, userType: 'Customer' | 'Vendor', companyCode: number) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const abortController = new AbortController();

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
        signal: abortController.signal,
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
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Login request cancelled');
        return;
      }

      console.error('Login error:', error);

      // Provide user-friendly error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }

      throw error;
    }
  };

  const register = async (email: string, password: string, mobileNo: string, userType: 'Customer' | 'Vendor', companyCode: number) => {
    const abortController = new AbortController();

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const registerUrl = `${API_BASE_URL}/api/auth/register`;

      console.log('Attempting registration to:', registerUrl);

      const response = await fetch(registerUrl, {
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
        signal: abortController.signal,
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`
        }));
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration response data:', data);

      if (data.success) {
        // After successful registration, automatically log in
        console.log('Registration successful, logging in...');
        await login(email, password);
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Registration request cancelled');
        return;
      }

      console.error('Registration error:', error);

      // Provide user-friendly error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }

      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
