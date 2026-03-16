import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Presentation, Mail, Plus, Trash2, Search, UserPlus, X, Check, ShieldAlert, Edit2, Save } from 'lucide-react';

const FacultyManagement = () => {
    const [faculty, setFaculty] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', department: '' });
    const [loading, setLoading] = useState(true);

    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/auth/faculty-list');
            setFaculty(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/auth/faculty/${editingId}`, formData);
                setEditingId(null);
                alert('Faculty specialist updated successfully!');
            } else {
                await axios.post('/auth/add-faculty', formData);
                alert('Faculty specialist added successfully!');
            }
            fetchFaculty();
            setFormData({ name: '', email: '', password: '', phone: '', department: '' });
            setShowAddForm(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Error occurred while saving faculty');
        }
    };

    const startEdit = (member) => {
        setEditingId(member._id);
        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            department: member.department || '',
            password: '' // Keep password empty unless changing
        });
        setShowAddForm(true);
    };

    const deleteFaculty = async (id) => {
        if (window.confirm('Revoke access for this faculty member? This action is permanent.')) {
            try {
                await axios.delete(`/auth/faculty/${id}`);
                fetchFaculty();
            } catch (err) {
                alert('Failed to remove faculty');
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                        <Presentation size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Faculty Management</h1>
                        <p className="text-gray-500 text-sm">Manage educational experts and staff credentials.</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        if (editingId) {
                            setEditingId(null);
                            setFormData({ name: '', email: '', password: '', phone: '', department: '' });
                        }
                    }}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${showAddForm ? 'bg-gray-100 text-gray-600' : 'bg-purple-600 text-white shadow-purple-200 hover:bg-purple-700 hover:-translate-y-0.5'}`}
                >
                    {showAddForm ? <><X size={20} /> <span>Cancel</span></> : <><UserPlus size={20} /> <span>Add Faculty Expert</span></>}
                </button>
            </div>

            {/* Add Faculty Form */}
            {showAddForm && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-down">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        {editingId ? <><Edit2 size={20} className="text-purple-600" /> Update Faculty Expert</> : <><Plus size={20} className="text-purple-600" /> New Faculty Onboarding</>}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input type="text" placeholder="Dr. Sarah Johnson" required className="w-full border border-gray-100 p-3.5 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none bg-gray-50/50 font-medium" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <input type="email" placeholder="sarah.j@university.com" required className="w-full border border-gray-100 p-3.5 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none bg-gray-50/50 font-medium" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input type="tel" placeholder="+91 9000000000" required className="w-full border border-gray-100 p-3.5 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none bg-gray-50/50 font-medium" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                            <input type="text" placeholder="Computer Science" required className="w-full border border-gray-100 p-3.5 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none bg-gray-50/50 font-medium" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{editingId ? 'Change Password (Optional)' : 'Login Password'}</label>
                            <input type="password" placeholder="••••••••" required={!editingId} className="w-full border border-gray-100 p-3.5 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none bg-gray-50/50 font-medium" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <button type="submit" className="md:col-span-2 lg:col-span-3 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-black transition-all shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2 mt-2">
                            {editingId ? <><Save size={20} /> Update Information</> : <><Check size={20} /> Confirm Registration</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Faculty Directory */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Institutional Experts <span className="text-sm font-normal text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{faculty.length} Total</span>
                    </h2>
                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black" />
                        <input
                            type="text"
                            placeholder="Search names..."
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="p-6">Expert Identity</th>
                                <th className="p-6">Email / Phone</th>
                                <th className="p-6">Department</th>

                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="p-16 text-center text-gray-300 font-bold uppercase tracking-widest italic">Authenticating Records...</td></tr>
                            ) : faculty.length === 0 ? (
                                <tr><td colSpan="4" className="p-16 text-center text-gray-400">No faculty members registered in the current database.</td></tr>
                            ) : faculty.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                                <tr key={f._id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-400 font-black text-base">
                                                {f.name.charAt(0)}
                                            </div>
                                            <p className="font-bold text-gray-900 tracking-tight">{f.name}</p>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-medium text-sm text-gray-700">{f.email}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{f.phone || 'No phone'}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-sm font-bold text-gray-700">{f.department || '—'}</span>
                                    </td>

                                    <td className="p-6 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => startEdit(f)}
                                                className="p-3 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all"
                                                title="Edit Faculty"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                            <button
                                                onClick={() => deleteFaculty(f._id)}
                                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                title="Revoke Access"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Caution Banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start space-x-4">
                <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={24} />
                <div>
                    <h4 className="text-amber-800 font-bold mb-1">Administrative Note</h4>
                    <p className="text-amber-700/70 text-sm leading-relaxed">
                        Adding faculty members grants them immediate access to mark attendance and upload student grades. Ensure all credentials provided are accurate and follow institutional security protocols.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FacultyManagement;
