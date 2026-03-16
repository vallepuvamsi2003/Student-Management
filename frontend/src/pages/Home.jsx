import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, CalendarCheck, BarChart, Mail, Phone, MapPin, ArrowRight, ShieldCheck, Globe, Zap } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col selection:bg-[#9D71FD]/30">
            {/* Background Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#9D71FD]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#38BDF8]/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Navigation Bar */}
            <nav className="fixed w-full top-0 bg-white/60 backdrop-blur-xl border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center h-20">
                    <div className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-[#9D71FD] rounded-xl flex items-center justify-center shadow-lg shadow-[#9D71FD]/40 group-hover:scale-110 transition-transform">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-gray-900 uppercase italic">Student <span className="text-[#9D71FD]">Management</span></span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8 text-sm font-black uppercase tracking-widest">
                        <a href="#features" className="text-gray-400 hover:text-gray-900 transition-colors">Features</a>
                        <a href="#about" className="text-gray-400 hover:text-gray-900 transition-colors">About</a>
                        <a href="#contact" className="text-gray-400 hover:text-gray-900 transition-colors">Contact</a>
                        <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-[#9D71FD] transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-gray-200">
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-44 pb-24 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-16 overflow-visible">
                <div className="max-w-4xl space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center space-x-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full text-xs font-bold text-[#9D71FD] uppercase tracking-widest mx-auto">
                        <Zap size={14} /> <span>Student Excellence Platform</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
                        Modernizing <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D71FD] to-[#38BDF8]">Student Management.</span>
                    </h1>
                    <p className="text-xl text-gray-500 leading-relaxed mx-auto max-w-2xl font-medium">
                        A robust, all-in-one platform designed to streamline student administration, academic tracking, and institutional data with high-performance digital tools.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link to="/login" className="w-full sm:w-auto bg-[#9D71FD] hover:bg-[#8B5CF6] text-white px-10 py-4 rounded-2xl font-black transition-all transform hover:-translate-y-1 shadow-2xl shadow-[#9D71FD]/40 flex items-center justify-center gap-3">
                            Launch Portal <ArrowRight size={20} />
                        </Link>
                        <a href="#features" className="w-full sm:w-auto bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-100 px-8 py-4 rounded-2xl font-bold transition-all text-center">
                            Explore Features
                        </a>
                    </div>
                    <div className="flex items-center justify-center gap-8 pt-8 border-t border-gray-100">
                        <div>
                            <p className="text-2xl font-bold text-gray-900 tracking-tight">99.9%</p>
                            <p className="text-sm text-gray-400 uppercase font-black">Uptime</p>
                        </div>
                        <div className="w-px h-10 bg-gray-100"></div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 tracking-tight">24/7</p>
                            <p className="text-sm text-gray-400 uppercase font-black">Support</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Comprehensive Feature Set.</h2>
                        <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">Everything you need to manage your educational data in one unified, high-performance interface.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Users size={28} />}
                            title="Student Records"
                            description="Real-time enrollment, detailed profile management, and dynamic academic progress tracking."
                            color="text-[#9D71FD]"
                            bg="bg-[#9D71FD]/10"
                        />
                        <FeatureCard
                            icon={<BookOpen size={28} />}
                            title="Course Management"
                            description="Curriculum builder with faculty assignment and departmental hierarchy organization."
                            color="text-[#38BDF8]"
                            bg="bg-[#38BDF8]/10"
                        />
                        <FeatureCard
                            icon={<CalendarCheck size={28} />}
                            title="Attendance Tracking"
                            description="Digital logbook with instant synchronization and percentage-based automated reporting."
                            color="text-emerald-400"
                            bg="bg-emerald-400/10"
                        />
                        <FeatureCard
                            icon={<BarChart size={28} />}
                            title="Result Portal"
                            description="Advanced grading engine with performance visualization and automatic transcript generation."
                            color="text-amber-400"
                            bg="bg-amber-400/10"
                        />
                    </div>
                </div>
            </section>

            {/* Content / Info Section */}
            <section id="about" className="py-24 border-y border-gray-100 bg-gray-50/30">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-20">
                    <div className="md:w-1/2 flex flex-col gap-6">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter">The Modern Standard for Management</h2>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed">
                            This Student Management System replaces outdated paperwork with a secure, highly-integrated digital dashboard that syncs across every device instantly, ensuring data integrity and administrative speed.
                        </p>
                        <div className="space-y-4 pt-6">
                            <InfoCheck text="End-to-end data encryption for student privacy" />
                            <InfoCheck text="Real-time notifications for attendance and results" />
                            <InfoCheck text="Mobile-first responsive architecture" />
                        </div>
                    </div>
                    <div className="md:w-1/2 grid grid-cols-2 gap-6">
                        <div className="bg-white p-10 rounded-3xl border-2 border-black hover:border-[#9D71FD]/30 transition-shadow hover:shadow-xl group">
                            <ShieldCheck size={40} className="text-[#9D71FD] mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="text-xl font-bold mb-2 text-gray-900">Secure Storage</h4>
                            <p className="text-gray-500 text-sm font-medium">Military-grade protection for sensitive academic records.</p>
                        </div>
                        <div className="bg-white p-10 rounded-3xl border-2 border-black hover:border-[#38BDF8]/30 transition-shadow hover:shadow-xl group">
                            <Globe size={40} className="text-[#38BDF8] mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="text-xl font-bold mb-2 text-gray-900">Cloud Access</h4>
                            <p className="text-gray-500 text-sm font-medium">Access your portal from anywhere with a secure internet connection.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-[#121214] pt-24 pb-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="md:col-span-2 space-y-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-[#9D71FD] rounded-lg flex items-center justify-center">
                                    <GraduationCap size={20} className="text-white" />
                                </div>
                                <span className="text-xl font-black tracking-tighter text-white uppercase italic">Student <span className="text-[#9D71FD]">Management</span></span>
                            </div>
                            <p className="text-gray-500 max-w-sm text-lg leading-relaxed">
                                Redefining institutional efficiency. The next generation of Student Management is here.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6">Quick Links</h3>
                            <ul className="space-y-4 text-gray-500 font-medium">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                                <li><Link to="/login" className="hover:text-white transition-colors">SignIn</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6">Contact</h3>
                            <ul className="space-y-4 text-gray-500 font-medium">
                                <li className="flex items-center gap-3"><Mail size={18} className="text-[#9D71FD]" /> support@studentmanagement.io</li>
                                <li className="flex items-center gap-3"><Phone size={18} className="text-[#38BDF8]" /> +1 (555) 000-SMS</li>
                                <li className="flex items-center gap-3"><MapPin size={18} className="text-purple-400" /> Digital Valley, CA</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-12 flex flex-col md:row items-center justify-between gap-6 text-gray-600 text-sm">
                        <p>© 2026 Student Management System. All rights reserved.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
                {/* Footer BG element */}
                <div className="absolute bottom-[-50%] right-[-5%] w-[600px] h-[600px] bg-[#9D71FD]/5 rounded-full blur-[150px]"></div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, color, bg }) => (
    <div className="bg-white p-8 rounded-[2rem] border-2 border-black hover:border-[#9D71FD]/30 transition-all hover:-translate-y-2 group shadow-sm hover:shadow-2xl">
        <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 leading-relaxed font-medium">{description}</p>
    </div>
);

const InfoCheck = ({ text }) => (
    <div className="flex items-center space-x-3">
        <div className="w-5 h-5 bg-[#9D71FD]/10 text-[#9D71FD] rounded-full flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={14} />
        </div>
        <p className="text-gray-600 font-bold text-sm uppercase tracking-wide">{text}</p>
    </div>
);

export default Home;
