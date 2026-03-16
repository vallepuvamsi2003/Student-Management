import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Search, Plus, Edit2, Trash2, X, Check, Save, UserPlus, GraduationCap, Mail, Phone, BookOpen, Layers } from 'lucide-react';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const COURSES = ['CSE', 'CSE-AI', 'CSE-AIML', 'CSE-DS', 'ECE', 'EEE', 'CIVIL', 'MECH'];
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        email: '',
        phone: '',
        course: '', // This will now be for B.Tech/M.Tech etc.
        department: '',
        branch: '', // This will now be for CSE/ECE etc.
        year: 1,
        password: '',
        semester: ''
    });

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/students');
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/students/${editingId}`, formData);
                setEditingId(null);
            } else {
                await axios.post('/students', formData);
            }
            fetchStudents();
            setFormData({ name: '', rollNumber: '', email: '', phone: '', course: '', department: '', branch: '', year: 1, password: '', semester: '' });
            setShowAddForm(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Error occurred');
        }
    };

    const startEdit = (student) => {
        setEditingId(student._id);
        setFormData({
            name: student.name,
            rollNumber: student.rollNumber,
            email: student.email,
            phone: student.phone,
            course: student.course || '',
            department: student.department || '',
            branch: student.branch || '',
            year: student.year || 1,
            password: '',
            semester: student.semester || ''
        });
        setShowAddForm(true);
    };

    const deleteStudent = async (id) => {
        if (window.confirm('Are you sure you want to delete this student? This action is permanent.')) {
            try {
                await axios.delete(`/students/${id}`);
                fetchStudents();
            } catch (err) {
                alert('Failed to delete student');
            }
        }
    };

    const filteredStudents = students.filter(s =>
        !s.rollNumber.startsWith('FAC-') && !s.rollNumber.startsWith('ADM-') && (
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#9D71FD]/10 text-[#9D71FD] rounded-xl flex items-center justify-center">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
                        <p className="text-gray-500 text-sm">Add, remove and manage all student cohorts.</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        if (editingId) {
                            setEditingId(null);
                            setFormData({ name: '', rollNumber: '', email: '', phone: '', course: '', department: '', branch: '', year: 1, password: '', semester: '' });
                        }
                    }}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${showAddForm ? 'bg-gray-100 text-gray-600' : 'bg-[#9D71FD] text-white shadow-[#9D71FD]/30 hover:shadow-[#9D71FD]/50 hover:-translate-y-0.5'}`}
                >
                    {showAddForm ? <><X size={20} /> <span>Cancel</span></> : <><UserPlus size={20} /> <span>Add New Student</span></>}
                </button>
            </div>

            {/* Add/Edit Form Section */}
            {showAddForm && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-down">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        {editingId ? <><Edit2 size={20} className="text-[#9D71FD]" /> Edit Student</> : <><Plus size={20} className="text-[#9D71FD]" /> Add New Student</>}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormInput label="Full Name" type="text" placeholder="John Doe" required value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                        <FormInput label="Roll Number" type="text" placeholder="STU-101" required value={formData.rollNumber} onChange={v => setFormData({ ...formData, rollNumber: v })} />
                        <FormInput label="Email Address" type="email" placeholder="john@example.com" required value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                        <FormInput label="Phone Number" type="tel" placeholder="+91 0000000000" required value={formData.phone} onChange={v => setFormData({ ...formData, phone: v })} />

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 ml-1">Course</label>
                            <select
                                required
                                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#9D71FD]/50 outline-none bg-gray-50/50 font-medium"
                                value={formData.course}
                                onChange={e => setFormData({ ...formData, course: e.target.value })}
                            >
                                <option value="">Select Course</option>
                                <option value="B.Tech">B.Tech</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="MBA">MBA</option>
                                <option value="MCA">MCA</option>
                            </select>
                        </div>

                        <FormInput label="Department" type="text" placeholder="Computer Science" value={formData.department} onChange={v => setFormData({ ...formData, department: v })} />

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 ml-1">Branch</label>
                            <select
                                required
                                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#9D71FD]/50 outline-none bg-gray-50/50 font-medium"
                                value={formData.branch}
                                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                            >
                                <option value="">Select Branch</option>
                                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="Academic Year" type="number" min="1" max="5" value={formData.year} onChange={v => setFormData({ ...formData, year: v })} />
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700 ml-1">Semester</label>
                                <select
                                    required
                                    className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#9D71FD]/50 outline-none bg-gray-50/50 font-medium"
                                    value={formData.semester}
                                    onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                >
                                    <option value="">Select Semester</option>
                                    <option value="1st Sem">1st Sem</option>
                                    <option value="2nd Sem">2nd Sem</option>
                                </select>
                            </div>
                        </div>

                        {!editingId && (
                            <div className="lg:col-span-2">
                                <FormInput label="Create Login Password" type="password" required placeholder="Min 6 characters" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} />
                            </div>
                        )}

                        <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-gray-50 mt-2">
                            <button
                                type="submit"
                                className="w-full bg-[#9D71FD] hover:bg-[#8B5CF6] text-white py-4 rounded-xl font-bold transition-all shadow-xl shadow-[#9D71FD]/30 flex items-center justify-center gap-2"
                            >
                                {editingId ? <><Save size={20} /> Update Student Record</> : <><Check size={20} /> Register Student</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Student Table / List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Student Directory</h2>
                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold" />
                        <input
                            type="text"
                            placeholder="Search name or roll..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#9D71FD]/50 transition-all font-medium text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest">
                                <th className="p-6">Roll No</th>
                                <th className="p-6">Student Info</th>
                                <th className="p-6">Course & Dept</th>
                                <th className="p-6">Year/Sem</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-medium">Fetching records...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-medium">No students found matching your criteria.</td></tr>
                            ) : filteredStudents.map(student => (
                                <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6 font-mono font-bold text-[#9D71FD]">{student.rollNumber}</td>
                                    <td className="p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-black">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{student.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-700 text-sm">{student.course || 'Unassigned'} {student.branch ? `- ${student.branch}` : ''}</span>
                                            <span className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tight">{student.department || 'General'}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-700 text-sm">Year {student.year || 1}</span>
                                            <span className="text-xs text-gray-400 mt-1">{student.semester || '1st Sem'}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => startEdit(student)}
                                                className="p-2 text-gray-400 hover:text-[#9D71FD] hover:bg-[#9D71FD]/5 rounded-lg transition-colors"
                                                title="Edit Student"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteStudent(student._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Student"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const FormInput = ({ label, ...props }) => (
    <div className="space-y-1">
        <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
        <input
            {...props}
            onChange={e => props.onChange(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#9D71FD]/50 outline-none bg-gray-50/50 font-medium placeholder:text-gray-300"
        />
    </div>
);

export default StudentManagement;
