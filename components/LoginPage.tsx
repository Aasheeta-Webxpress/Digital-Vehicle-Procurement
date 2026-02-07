import { useState } from 'react';
import { useAuth } from './AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2, UserPlus, Phone, Building2 } from 'lucide-react';

const LoginPage = () => {
    const { login, register } = useAuth();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [userType, setUserType] = useState<'Customer' | 'Vendor'>('Customer');
    const [companyCode, setCompanyCode] = useState('12');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegisterMode) {
                // Validate password for registration
                if (password.length < 8) {
                    throw new Error('Password must be at least 8 characters long');
                }
                if (!/[A-Z]/.test(password)) {
                    throw new Error('Password must contain at least one uppercase letter');
                }
                if (!/[a-z]/.test(password)) {
                    throw new Error('Password must contain at least one lowercase letter');
                }
                if (!/[0-9]/.test(password)) {
                    throw new Error('Password must contain at least one number');
                }
                if (!/[@$!%*?&#]/.test(password)) {
                    throw new Error('Password must contain at least one special character (@$!%*?&#)');
                }

                await register(email, password, mobileNo, userType, parseInt(companyCode));
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            setError(err.message || (isRegisterMode ? 'Registration failed' : 'Invalid email or password'));
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setError('');
        setEmail('');
        setPassword('');
        setMobileNo('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                        <span className="text-2xl font-black text-white">TV</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">TVS PROCUREMENT</h1>
                    <p className="text-sm text-gray-500 font-medium">Digital Vehicle Procurement System</p>
                </div>

                {/* Login/Register Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-1">
                            {isRegisterMode ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isRegisterMode ? 'Register to access the system' : 'Sign in to access your dashboard'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-red-900">
                                    {isRegisterMode ? 'Registration Failed' : 'Login Failed'}
                                </p>
                                <p className="text-xs text-red-700 mt-0.5">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-wide">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                    placeholder="your.email@company.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-wide">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                    placeholder={isRegisterMode ? "Min 8 chars, 1 upper, 1 lower, 1 number, 1 special" : "Enter your password"}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            {isRegisterMode && (
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Must contain: 8+ characters, uppercase, lowercase, number, and special char
                                </p>
                            )}
                        </div>

                        {/* Registration-only fields */}
                        {isRegisterMode && (
                            <>
                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-wide">
                                        Mobile Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={mobileNo}
                                            onChange={(e) => setMobileNo(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                            placeholder="9876543210"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* User Type */}
                                <div>
                                    <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-wide">
                                        User Type
                                    </label>
                                    <select
                                        value={userType}
                                        onChange={(e) => setUserType(e.target.value as 'Customer' | 'Vendor')}
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                                        disabled={isLoading}
                                    >
                                        <option value="Customer">Customer</option>
                                        <option value="Vendor">Vendor</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {isRegisterMode ? 'Creating Account...' : 'Signing In...'}
                                </>
                            ) : (
                                <>
                                    {isRegisterMode ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                                    {isRegisterMode ? 'Create Account' : 'Sign In'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={toggleMode}
                            className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors"
                            disabled={isLoading}
                        >
                            {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400 font-medium">
                        TVS Supply Chain Solutions © 2024
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                        Python-Firebase Stack • FastAPI Backend
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
