import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Hash, BookOpen, Calendar, Check, Target, TrendingUp, TrendingDown, Layers, Trash2, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const Marks = () => {
    const { user } = useAuth();
    const [studentRecords, setStudentRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        studentName: '',
        courseName: '',
        marks: '',
        grade: '',
        studentEmail: ''
    });

    useEffect(() => {
        fetchMarks();
    }, [user]);

    const fetchMarks = async () => {
        setLoading(true);
        try {
            const endpoint = user.role === 'Student' ? `/upload/performance/${user.email}` : '/upload/performance';
            const res = await axios.get(endpoint);
            
            // Re-format marks correctly (they are strings in the performance model but might be numbers or combinations)
            const mappedRecords = (res.data || []).map(r => ({ ...r, numericMarks: parseFloat(r.marks) || 0 }));
            setStudentRecords(mappedRecords);
        } catch (err) {
            console.error('Error fetching marks:', err);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/marks/self-record', {
                studentName: formData.studentName,
                courseName: formData.courseName,
                marksObtained: Number(formData.marks),
                totalMarks: 100,
                grade: formData.grade.toUpperCase(),
                examType: 'Mid', // default for manual
                studentEmail: formData.studentEmail
            });
            fetchMarks();
            setFormData({
                studentName: '',
                courseName: '',
                marks: '',
                grade: '',
                studentEmail: ''
            });
            alert('Grade record captured successfully.');
        } catch (err) {
            alert('Failed to record marks: ' + (err.response?.data?.message || err.message));
        }
    };

    const deleteRecord = async (id) => {
        if (window.confirm('Remove this uploaded academic record?')) {
            try {
                await axios.delete(`/upload/performance/${id}?type=marks`);
                setStudentRecords(studentRecords.filter(r => r._id !== id));
            } catch (err) {
                alert('Failed to delete uploaded record');
            }
        }
    };

    // Only show records that have marks data
    const recordsWithMarks = studentRecords.filter(r => r.hasMarks);

    const filteredRecords = recordsWithMarks.filter(r =>
        (r.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.studentEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.grade || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10 text-gray-900">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard label="Average Performance" value={`${recordsWithMarks.length > 0 ? Math.round(recordsWithMarks.reduce((a, b) => a + (b.numericMarks || 0), 0) / recordsWithMarks.length) : 0}%`} color="text-[#9D71FD]" icon={<Target size={24} />} />
                <MetricCard label="Best Result" value={`${recordsWithMarks.length > 0 ? Math.max(...recordsWithMarks.map(r => r.numericMarks || 0)) : 0}%`} color="text-emerald-500" icon={<TrendingUp size={24} />} />
                <MetricCard label="Subjects Tracked" value={new Set(recordsWithMarks.map(r => r.subject)).size} color="text-gray-900" icon={<Layers size={24} />} />
                <div className="bg-gradient-to-br from-[#9D71FD] to-[#38BDF8] p-8 rounded-[2.5rem] text-white flex flex-col justify-center shadow-2xl shadow-[#9D71FD]/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Overall Standing</p>
                    <h3 className="text-4xl font-black">EXCELLENT</h3>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
                <div className="p-10 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tighter">Uploaded Academic Transcript</h2>
                        <span className="text-[10px] font-black text-[#9D71FD] uppercase tracking-widest bg-[#9D71FD]/5 px-3 py-1 rounded-full mt-2 inline-block">{recordsWithMarks.length} Record{recordsWithMarks.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#9D71FD]/20 transition-all font-bold text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-8">Upload Date / Subject</th>
                                {user.role !== 'Student' && <th className="p-8">Target Student</th>}
                                <th className="p-8 text-center">Marks Score</th>
                                <th className="p-8 text-center border-l border-gray-50">Letter Grade</th>
                                {user.role !== 'Student' && <th className="p-8 text-right">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={user.role === 'Student' ? "3" : "5"} className="p-16 text-center text-gray-300 font-bold uppercase tracking-widest animate-pulse">Analyzing Performance...</td></tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr><td colSpan={user.role === 'Student' ? "3" : "5"} className="p-16 text-center text-gray-400 font-medium tracking-tight">{searchTerm ? 'No records match your search.' : 'No academic records documented.'}</td></tr>
                            ) : filteredRecords.map((record, i) => (
                                <tr key={i} className="hover:bg-gray-50/20 transition-colors">
                                    <td className="p-8">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-700 text-sm">{record.subject}</span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(record.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    {user.role !== 'Student' && (
                                        <td className="p-8">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 text-xs">{record.studentName}</span>
                                                <span className="text-[9px] font-black text-[#9D71FD] uppercase tracking-tighter mt-1">{record.studentEmail}</span>
                                                <span className="text-[9px] font-black text-gray-400 mt-1 uppercase">Roll: {record.rollNumber}</span>
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-8 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-black text-[#38BDF8] text-xl">
                                                {record.marks}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center border-l border-gray-50">
                                        <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black text-sm shadow-sm ${['A+', 'A', 'O'].includes(record.grade) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            ['B+', 'B', 'A'].includes(record.grade) ? 'bg-[#9D71FD]/5 text-[#9D71FD] border border-[#9D71FD]/10' :
                                                'bg-gray-50 text-gray-400 border border-gray-100'
                                            }`}>
                                            {record.grade || '-'}
                                        </span>
                                    </td>
                                    {user.role !== 'Student' && (
                                        <td className="p-8 text-right">
                                            <button
                                                onClick={() => deleteRecord(record._id)}
                                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-100 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, color, icon }) => (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center space-x-6 hover:shadow-xl transition-all hover:-translate-y-1">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <h3 className={`text-3xl font-black ${color}`}>{value}</h3>
        </div>
    </div>
);

export default Marks;
