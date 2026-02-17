import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple security: Check against env variable or hardcoded fallback
        // In a real app, use Supabase Auth. This is a requested simple implementation.
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

        if (password === adminPassword) {
            localStorage.setItem('isAdmin', 'true');
            navigate('/admin');
        } else {
            setError('Password salah!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                        <Lock className="text-white" size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">Admin Area</h2>
                <p className="text-gray-500 text-center mb-8">Masukkkan password untuk akses dashboard</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password Admin"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
