import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        console.log('API URL:', import.meta.env.VITE_API_URL); // Debugging

        const result = await login(email, password);

        setIsLoading(false);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
            {/* ... rest of the component structure remains unchanged ... */}
            <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-4xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">

                {/* Left Side - Banner */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-12 flex-col justify-center relative">
                    <div className="absolute inset-0 bg-black opacity-10 pattern-grid-lg"></div>
                    <h1 className="text-5xl font-extrabold mb-6 relative z-10 tracking-tight">LeadFlow</h1>
                    <p className="text-blue-100 text-xl relative z-10 font-light leading-relaxed">
                        Empower your business with intelligent lead management and automated workflows.
                    </p>
                    <div className="absolute bottom-10 left-12 text-blue-300 text-sm">
                        © 2026 CRM System
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
                        <p className="text-gray-500 mt-2">Access your dashboard</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <FaEnvelope />
                                </div>
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <FaLock />
                                </div>
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 hover:translate-y-[-1px] hover:shadow-xl flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt className="mr-2" /> Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <p className="text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 font-bold hover:text-blue-800 transition-colors hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
