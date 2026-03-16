import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Plus, Trash2, Check, Hash, Calendar, Layers } from 'lucide-react';

const CourseManagement = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        courseName: '',
        courseCode: '',
        registryDate: new Date().toISOString().split('T')[0],
        department: '',
        credits: 3
    });

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            // Use global /courses for Admin and Students so they can manage the catalog
            const endpoint = (user.role === 'Faculty') ? '/courses/my-courses' : '/courses';
            try {
                const res = await axios.get(endpoint);
                setCourses(res.data);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
            setLoading(false);
        };
        fetchCourses();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/courses', {
                courseName: formData.courseName,
                courseCode: formData.courseCode,
                department: formData.department || 'General',
                credits: formData.credits,
                semester: '1st Semester' // default
            });
            const endpoint = (user.role === 'Faculty') ? '/courses/my-courses' : '/courses';
            const res = await axios.get(endpoint);
            setCourses(res.data);
            setFormData({
                courseName: '',
                courseCode: '',
                registryDate: new Date().toISOString().split('T')[0],
                department: '',
                credits: 3
            });
            alert('Course recorded successfully!');
        } catch (err) {
            alert('Error recording course: ' + (err.response?.data?.message || err.message));
        }
    };

    const deleteCourse = async (id) => {
        if (window.confirm('Remove this course entry?')) {
            try {
                await axios.delete(`/courses/${id}`);
                setCourses(courses.filter(c => c._id !== id));
            } catch (err) {
                alert('Failed to delete course');
            }
        }
    };

    const filteredCourses = courses.filter(c =>
        c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Direct Entry Form Section */}
            {(user.role === 'Faculty' || user.role === 'Admin') && (
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 bg-[#38BDF8]/10 text-[#38BDF8] rounded-xl flex items-center justify-center">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tighter">Course Registration</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Input course details to begin tracking</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Calendar size={12} className="text-[#38BDF8]" /> Registry Date
                            </label>
                            <input
                                type="date"
                                required
                                className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-[#38BDF8]/20 outline-none font-bold text-gray-700"
                                value={formData.registryDate}
                                onChange={e => setFormData({ ...formData, registryDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Hash size={12} className="text-[#38BDF8]" /> Course Code
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. CS-101"
                                required
                                className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-[#38BDF8]/20 outline-none font-bold text-gray-700 placeholder:text-gray-300"
                                value={formData.courseCode}
                                onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <BookOpen size={12} className="text-[#38BDF8]" /> Course Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Introduction to Programming"
                                required
                                className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-[#38BDF8]/20 outline-none font-bold text-gray-700 placeholder:text-gray-300"
                                value={formData.courseName}
                                onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <button type="submit" className="w-full bg-[#38BDF8] hover:bg-[#0EA5E9] text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-[#38BDF8]/20 flex items-center justify-center gap-3 active:scale-95 group">
                                <Check size={20} className="group-hover:scale-110 transition-transform" /> Register This Course
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
                <div className="p-10 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tighter">Recorded Catalog</h2>
                        <span className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest bg-[#38BDF8]/5 px-3 py-1 rounded-full">{courses.length} Entries</span>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#38BDF8]/20 transition-all font-bold text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-8">Course Code</th>
                                <th className="p-8">Course Name</th>
                                <th className="p-8">Credits</th>
                                <th className="p-8 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="p-16 text-center text-gray-300 font-bold uppercase tracking-widest animate-pulse">Accessing Server...</td></tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr><td colSpan="4" className="p-16 text-center text-gray-400 font-medium">No recorded entries found.</td></tr>
                            ) : filteredCourses.map(course => (
                                <tr key={course._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-8 font-black text-[#38BDF8] tracking-widest text-sm uppercase">{course.courseCode}</td>
                                    <td className="p-8 font-bold text-gray-700">{course.courseName}</td>
                                    <td className="p-8">
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">{course.credits} Units</span>
                                    </td>
                                    <td className="p-8 text-right">
                                        {(user.role === 'Faculty' || user.role === 'Admin') && (
                                            <button
                                                onClick={() => deleteCourse(course._id)}
                                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
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

export default CourseManagement;
