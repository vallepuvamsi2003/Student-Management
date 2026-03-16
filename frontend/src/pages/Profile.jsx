import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Hash, BookOpen, Layers, Calendar, CalendarDays, Edit2, X, Camera, Save, ShieldCheck, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', department: '', branch: '', year: 1, semester: '' });
    const [saving, setSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const isAdmin = user?.role === 'Admin';
    const isFaculty = user?.role === 'Faculty';
    const isStudent = user?.role === 'Student';

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            if (isAdmin) {
                // Admins fetch their user document directly
                const res = await axios.get('/auth/profile/me');
                setProfile(res.data);
                setEditForm({ name: res.data.name || '', email: res.data.email || '', phone: res.data.phone || '' });
            } else {
                // Students and Faculty fetch their merged profile
                const res = await axios.get('/students/profile');
                setProfile(res.data);
                setEditForm({
                    name: res.data.name || '',
                    email: res.data.email || '',
                    phone: res.data.phone || '',
                    department: res.data.department || '',
                    branch: res.data.branch || '',
                    year: res.data.year || 1,
                    semester: res.data.semester || '1st Semester'
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let res;
            if (isAdmin) {
                res = await axios.put('/auth/profile/me', editForm);
                setProfile(res.data);
            } else {
                res = await axios.put('/students/profile', editForm);
                setProfile(res.data);
            }
            window.dispatchEvent(new CustomEvent('sync-user', { detail: res.data }));
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile. Please try again.');
        }
        setSaving(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2000000) { alert('Image too large. Please select an image under 2MB.'); return; }
            const reader = new FileReader();
            reader.onloadend = async () => {
                setSaving(true);
                try {
                    // Only student profiles support image upload
                    const res = await axios.put('/students/profile', { profileImage: reader.result });
                    setProfile(res.data);
                } catch (err) { alert('Failed to upload image'); }
                setSaving(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        if (isAdmin) return;
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        if (isAdmin) return;
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleImageChange({ target: { files: [file] } });
        }
    };

    if (!profile) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#9D71FD]/10 flex items-center justify-center animate-pulse">
                <Shield size={32} className="text-[#9D71FD]" />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">Loading Profile...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10 px-4">
            {/* Header Banner */}
            <div className="relative">
                <div className={`relative w-full h-48 rounded-[2rem] shadow-2xl overflow-hidden group ${isAdmin ? 'bg-gradient-to-r from-[#7C3AED] via-[#9D71FD] to-[#6D28D9]' : isFaculty ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600' : 'bg-gradient-to-r from-[#9D71FD] via-[#8B5CF6] to-[#38BDF8]'}`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-700"></div>
                    {(isAdmin || isFaculty) && (
                        <div className="absolute top-6 right-6 flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                            <Shield size={14} className="text-white" />
                            <span className="text-white text-[10px] font-black uppercase tracking-widest">{isAdmin ? 'Admin Access' : 'Faculty Member'}</span>
                        </div>
                    )}
                </div>

                {/* Profile Picture */}
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-end z-20">
                    <div className="relative">
                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`w-32 h-32 rounded-[2rem] border-4 border-white bg-white overflow-hidden flex items-center justify-center shadow-xl transition-all duration-500 relative ${isDragging ? 'scale-110 !border-[#9D71FD] !bg-[#9D71FD]/5' : 'hover:scale-105'}`}
                        >
                            {(!isAdmin) && profile.profileImage ? (
                                <img src={profile.profileImage} alt="Profile" className={`w-full h-full object-cover ${isDragging ? 'opacity-30' : ''}`} />
                            ) : (
                                <span className={`text-5xl font-black text-[#9D71FD] uppercase select-none ${isDragging ? 'opacity-30' : ''}`}>{profile.name?.charAt(0)}</span>
                            )}
                            {isDragging && (
                                <div className="absolute inset-0 flex items-center justify-center text-[#9D71FD]">
                                    <Camera size={40} className="animate-bounce" />
                                </div>
                            )}
                        </div>
                        {(!isAdmin) && (
                            <button
                                onClick={() => fileInputRef.current.click()}
                                disabled={saving}
                                className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-xl text-gray-400 hover:text-[#9D71FD] z-30 transition-all hover:scale-110 active:scale-95 border border-gray-100"
                            >
                                <Camera size={16} />
                            </button>
                        )}
                        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="pt-16 pb-10 bg-white rounded-[2.2rem] shadow-sm border border-gray-50 px-10 relative animate-fade-in-up">

                {/* Edit Actions */}
                <div className="absolute top-8 right-10">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center space-x-2 bg-gray-50 text-gray-400 hover:bg-[#9D71FD] hover:text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100 shadow-sm"
                        >
                            <Edit2 size={14} /> <span>Edit Profile</span>
                        </button>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-[#9D71FD] hover:bg-[#8B5CF6] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#9D71FD]/30 flex items-center gap-2"
                            >
                                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Name & Role */}
                <div className="mb-10 text-center">
                    {isEditing ? (
                        <div className="space-y-3 max-w-sm mx-auto">
                            <input
                                className="text-3xl font-black text-gray-900 w-full text-center border-b border-[#9D71FD]/20 focus:border-[#9D71FD] outline-none pb-1 transition-colors bg-transparent"
                                value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="Full Name"
                            />
                            <div className="flex justify-center flex-wrap gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-gray-50 text-gray-400 border-gray-100`}>
                                    {user?.role} Account
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{profile.name}</h1>
                            <div className="flex items-center justify-center space-x-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isAdmin ? 'bg-purple-50 text-purple-600 border-purple-100' : isFaculty ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-[#9D71FD]/10 text-[#9D71FD] border-[#9D71FD]/10'}`}>
                                    {user?.role}
                                </span>
                                <span className="text-gray-400 text-xs font-bold">{profile.email}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-6 border-t border-gray-50">
                    {/* Column 1 - Common */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Information</h3>

                        <div className="flex items-start space-x-4 group">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-300 flex items-center justify-center border border-gray-100">
                                <Mail size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        className="w-full border-b border-gray-100 focus:border-[#9D71FD] outline-none font-bold text-gray-800 text-sm py-0.5 bg-transparent transition-colors"
                                        value={editForm.email}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-bold text-gray-700">{profile.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 group">
                            <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 transition-all ${isEditing ? 'text-[#9D71FD]' : 'text-gray-300'}`}>
                                <Phone size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full border-b border-gray-100 focus:border-[#9D71FD] outline-none font-bold text-gray-800 text-sm py-0.5 bg-transparent transition-colors"
                                        value={editForm.phone}
                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <p className="font-bold text-gray-700">{profile.phone || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        {(isAdmin || isFaculty) && (
                            <div className="flex items-start space-x-4 group">
                                <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 ${isEditing ? 'text-purple-500' : 'text-purple-400'}`}>
                                    <Layers size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Institutional Department</p>
                                    {isEditing && !isAdmin ? (
                                        <input
                                            type="text"
                                            className="w-full border-b border-gray-100 focus:border-purple-500 outline-none font-bold text-gray-800 text-sm py-0.5 bg-transparent transition-colors"
                                            value={editForm.department}
                                            onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                                            placeholder="e.g. Computer Science"
                                        />
                                    ) : (
                                        <p className="font-bold text-gray-700">{profile.department || (isAdmin ? 'Administration' : 'Unassigned')}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Column 2 - Student specific OR Admin info */}
                    <div className="space-y-6">
                        {isAdmin ? (
                            <>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Privileges</h3>
                                <div className="space-y-3">
                                    {['Manage Student Accounts', 'Manage Faculty Staff', 'Course Catalog Control', 'Attendance & Marks Oversight'].map((priv) => (
                                        <div key={priv} className="flex items-center space-x-3">
                                            <div className="w-2 h-2 rounded-full bg-[#9D71FD]"></div>
                                            <span className="text-sm font-bold text-gray-600">{priv}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : isFaculty ? (
                            <>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Details</h3>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-300 flex items-center justify-center border border-gray-100">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Employee ID</p>
                                        <p className="font-bold text-gray-700">{profile.rollNumber || 'FAC-EMP'}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 hover:bg-indigo-50 transition-colors duration-500">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Teaching Status</p>
                                    <p className="text-xs font-bold text-indigo-700 leading-relaxed italic">"Verified institutional expert with full access to curriculum management and student assessment tools."</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Academic Details</h3>

                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-300 flex items-center justify-center border border-gray-100">
                                        <Hash size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Roll Number</p>
                                        <p className="font-bold text-gray-700">{profile.rollNumber || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-300 flex items-center justify-center border border-gray-100">
                                            <BookOpen size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Course</p>
                                            <p className="font-bold text-gray-700">{profile.course || 'B.Tech'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 ${isEditing ? 'text-[#9D71FD]' : 'text-gray-300'}`}>
                                            <Layers size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Branch/Dept</p>
                                            <p className="font-bold text-gray-700">{profile.department || 'CSE'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 ${isEditing ? 'text-[#9D71FD]' : 'text-gray-300'}`}>
                                            <Calendar size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Year</p>
                                            {isEditing ? (
                                                <input type="number" min="1" max="5" className="w-full border-b border-gray-100 focus:border-[#9D71FD] outline-none font-bold text-gray-800 text-sm py-0.5 bg-transparent" value={editForm.year} onChange={e => setEditForm({ ...editForm, year: e.target.value })} />
                                            ) : (
                                                <p className="font-bold text-gray-700">Year {profile.year}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 ${isEditing ? 'text-[#9D71FD]' : 'text-gray-300'}`}>
                                            <CalendarDays size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Semester</p>
                                            {isEditing ? (
                                                <input type="text" className="w-full border-b border-gray-100 focus:border-[#9D71FD] outline-none font-bold text-gray-800 text-sm py-0.5 bg-transparent" value={editForm.semester} onChange={e => setEditForm({ ...editForm, semester: e.target.value })} />
                                            ) : (
                                                <p className="font-bold text-gray-700">{profile.semester || '1st Sem'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>


                {/* Footer */}
                <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck size={14} className="text-[#9D71FD]" />
                        <span>Secured Account</span>
                    </div>
                    <span>Session: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
};

export default Profile;
