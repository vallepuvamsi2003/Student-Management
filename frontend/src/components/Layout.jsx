import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Users, BookOpen, CalendarCheck, FileText, User, UserPlus, Settings, Hash, ClipboardList, BookMarked, Bell, UploadCloud } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} />, roles: ['Admin', 'Faculty', 'Student'] },
        { name: 'Student Data', path: '/dashboard/students', icon: <Users size={20} />, roles: ['Admin'] },
        { name: 'Faculty Staff', path: '/dashboard/faculty', icon: <UserPlus size={20} />, roles: ['Admin'] },
        { name: 'Course Catalog', path: '/dashboard/courses', icon: <BookOpen size={20} />, roles: ['Admin', 'Faculty', 'Student'] },
        { name: 'Attendance', path: '/dashboard/attendance', icon: <CalendarCheck size={20} />, roles: ['Admin', 'Faculty', 'Student'] },
        { name: 'Gradebook', path: '/dashboard/marks', icon: <FileText size={20} />, roles: ['Admin', 'Faculty', 'Student'] },
        { name: 'Assignments', path: '/dashboard/assignments', icon: <ClipboardList size={20} />, roles: ['Admin', 'Faculty', 'Student'] },
        { name: 'Materials', path: '/dashboard/materials', icon: <BookMarked size={20} />, roles: ['Admin', 'Faculty', 'Student'] },
        { name: 'Bulk Upload', path: '/dashboard/bulk-upload', icon: <UploadCloud size={20} />, roles: ['Admin', 'Faculty'] },
        { name: 'My Profile', path: '/dashboard/profile', icon: <User size={20} />, roles: ['Admin', 'Faculty', 'Student'] },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Premium Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-full shadow-[20px_0_40px_-20px_rgba(0,0,0,0.02)] relative z-40">
                <div className="p-8 flex-shrink-0">
                    <div className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-tr from-[#9D71FD] to-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#9D71FD]/20">
                            <Hash size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Student <span className="text-[#9D71FD]">Management</span></h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Admin Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 space-y-2 pt-2 h-0">
                    {navItems.filter(item => item.roles.includes(user.role)).map(item => {
                        const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-4 py-4 rounded-2xl transition-all duration-300 font-bold group ${isActive ? 'bg-[#9D71FD] text-white shadow-xl shadow-[#9D71FD]/20' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <span className={`mr-4 p-1 rounded-lg transition-colors ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-gray-900'}`}>{item.icon}</span>
                                <span className="text-sm tracking-tight">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 mt-auto flex-shrink-0">

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-5 py-4 text-white bg-gradient-to-r from-[#9061F9] to-[#9D71FD] rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#9D71FD]/25 hover:scale-[1.02] active:scale-[0.98] group"
                    >
                        <LogOut size={16} className="mr-3 group-hover:rotate-12 transition-transform" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md h-20 flex items-center justify-between px-10 shrink-0 border-b border-gray-50 relative z-30">
                    <div>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Navigation / {location.pathname.replace('/dashboard', '').substring(1) || 'Overview'}</h2>
                        <h1 className="text-2xl font-black text-gray-900 capitalize tracking-tighter">
                            {location.pathname.replace('/dashboard', '').substring(1).replace('/', '') || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group hover:bg-[#9D71FD]/5 hover:text-[#9D71FD] transition-all relative">
                            <Bell size={20} className="group-hover:animate-bounce" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                        </button>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-gray-900 leading-tight">{user.name}</p>
                            <p className="text-[9px] text-[#9D71FD] font-black uppercase tracking-widest">{user.role} Access</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9D71FD] to-[#38BDF8] flex items-center justify-center text-white font-black shadow-xl shadow-[#9D71FD]/20 border-2 border-white transform hover:rotate-6 transition-transform cursor-pointer">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
