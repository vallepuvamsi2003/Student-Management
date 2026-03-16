import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Admin' // Strictly Admin
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signup(formData);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex text-white font-sans bg-[#1B1B1E] selection:bg-[#9D71FD]/30">
            {/* Background Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#9D71FD]/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-[#38BDF8]/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-xl mx-auto flex flex-col justify-center px-8 py-12 relative z-10">
                <div className="bg-white/5 backdrop-blur-xl border border-white/5 p-12 rounded-[3.5rem] shadow-2xl">
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-[#9D71FD] rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-6">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2 italic">Admin <span className="text-[#9D71FD]">Access</span></h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Create an administrative control account</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold mb-8 text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AuthInput
                            icon={<User size={18} />}
                            label="Admin Name"
                            value={formData.name}
                            onChange={(val) => setFormData({ ...formData, name: val })}
                            placeholder="Full Name"
                        />
                        <AuthInput
                            icon={<Mail size={18} />}
                            label="Admin Email"
                            type="email"
                            value={formData.email}
                            onChange={(val) => setFormData({ ...formData, email: val })}
                            placeholder="admin@institution.edu"
                        />
                        <AuthInput
                            icon={<Lock size={18} />}
                            label="Secure Password"
                            type="password"
                            value={formData.password}
                            onChange={(val) => setFormData({ ...formData, password: val })}
                            placeholder="••••••••"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#9D71FD] hover:bg-[#8B5CF6] text-white py-4 mt-4 rounded-2xl font-black transition-all shadow-xl shadow-[#9D71FD]/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Register Administrator'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-bold text-sm">
                            Already have an account? <Link to="/login" className="text-[#9D71FD] hover:underline ml-1">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AuthInput = ({ icon, label, ...props }) => (
    <div className="space-y-2 group">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-[#9D71FD] transition-colors">
            {label}
        </label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-[#9D71FD]">
                {icon}
            </div>
            <input
                {...props}
                onChange={(e) => props.onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 outline-none focus:border-[#9D71FD]/50 transition-all focus:bg-white/[0.08]"
                required
            />
        </div>
    </div>
);

export default SignUp;
