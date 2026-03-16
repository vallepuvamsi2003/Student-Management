import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Chrome, ArrowLeft } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Student');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password, role);

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

            {/* Left Box - Brand & Illustration */}
            <div className="hidden lg:flex w-[55%] flex-col relative bg-[#9D71FD] p-16 overflow-hidden rounded-r-[4rem] shadow-2xl">
                {/* Back Navigation */}
                <Link
                    to="/"
                    className="absolute top-10 left-10 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all group backdrop-blur-md border border-white/10 shadow-xl"
                >
                    <ArrowLeft size={20} className="text-white group-hover:-translate-x-1 transition-transform" />
                </Link>

                <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -right-20 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 mt-12">
                    <div className="flex items-center space-x-3 mb-16">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                            <GraduationCap size={28} className="text-[#9D71FD]" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-white uppercase italic">Student <span className="text-white/70">Management</span></span>
                    </div>

                    <div className="max-w-md space-y-6">
                        <h1 className="text-6xl font-black text-white leading-[0.95] tracking-tighter">
                            The Future of <br /> Academic <br /> Integrity.
                        </h1>
                        <p className="text-white/70 text-lg font-medium">
                            Manage records, track progress, and empower students with our next-generation digital ecosystem.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex-1 flex items-center justify-center mt-12 group">
                    <div className="relative w-full max-w-lg aspect-square bg-white/5 rounded-full border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-3xl">
                        <div className="w-64 h-64 bg-white/10 rounded-[3rem] rotate-12 flex items-center justify-center border border-white/20 shadow-inner group-hover:rotate-0 transition-transform duration-700">
                            <GraduationCap size={120} className="text-white drop-shadow-2xl -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Box - Auth Forms */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-20 py-12 relative z-10">
                <div className="w-full max-w-sm mx-auto">
                    {/* Header */}
                    <div className="mb-10 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2 italic">
                            Welcome <span className="text-[#9D71FD]">Back</span>
                        </h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            Enter credentials to access {role} portal
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold mb-8 animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 group-focus-within:text-[#9D71FD] transition-colors">
                                Access Level
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-6 text-white outline-none focus:border-[#9D71FD]/50 transition-all focus:bg-white/[0.08] font-black text-xs uppercase tracking-widest appearance-none cursor-pointer"
                            >
                                <option className="bg-[#1B1B1E]" value="Student">Student Login</option>
                                <option className="bg-[#1B1B1E]" value="Faculty">Teacher Login</option>
                                <option className="bg-[#1B1B1E]" value="Admin">Admin Login</option>
                            </select>
                        </div>

                        <AuthInput
                            icon={<Mail size={18} />}
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={setEmail}
                            placeholder="name@university.com"
                        />

                        <div className="relative">
                            <AuthInput
                                icon={<Lock size={18} />}
                                label="Secure Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={setPassword}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 bottom-3.5 text-gray-500 hover:text-[#9D71FD] transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-lg border-2 border-white/10 flex items-center justify-center transition-all ${rememberMe ? 'bg-[#9D71FD] border-[#9D71FD]' : 'bg-transparent'}`}>
                                    <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="hidden" />
                                    {rememberMe && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">Remember Me</span>
                            </label>

                            <button type="button" className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-[#9D71FD] transition-all">
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#9D71FD] hover:bg-[#8B5CF6] text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-[#9D71FD]/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Authenticating...' : `Sign In to ${role} Portal`}
                        </button>
                    </form>

                    {/* Footer Toggle */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-500 font-bold text-sm">
                            Student or Teacher?
                        </p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1 mb-4 font-black">
                            Accounts are pre-registered by Administration
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block text-[#9D71FD] hover:text-[#8B5CF6] font-black uppercase tracking-widest text-[10px] bg-[#9D71FD]/5 px-8 py-3 rounded-full border border-[#9D71FD]/10 transition-all hover:bg-[#9D71FD]/10 hover:shadow-lg"
                        >
                            Admin Registration
                        </Link>
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

const SocialButton = ({ icon, label, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-3 bg-white/5 border border-white/5 py-3.5 rounded-2xl hover:bg-white/10 transition-all hover:-translate-y-1 active:scale-95 group"
    >
        <span className="text-gray-400 group-hover:text-white transition-colors">{icon}</span>
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">{label}</span>
    </button>
);

export default Login;
