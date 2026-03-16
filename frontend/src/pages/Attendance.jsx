import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, CheckCircle2, XCircle, Plus, Hash, BookOpen, Calendar, Check, Trash2, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Attendance = () => {
    const { user } = useAuth();
    const [studentRecords, setStudentRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        studentName: '',
        courseName: '',
        status: 'Present',
        studentEmail: ''
    });

    useEffect(() => {
        fetchAttendance();
    }, [user]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const endpoint = user.role === 'Student' ? `/upload/performance/${user.email}` : '/upload/performance';
            const res = await axios.get(endpoint);
            setStudentRecords(res.data || []);
        } catch (err) {
            console.error('Error fetching attendance:', err);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/attendance/self-record', {
                date: formData.date,
                studentName: formData.studentName,
                courseName: formData.courseName,
                status: formData.status,
                studentEmail: formData.studentEmail
            });

            fetchAttendance();
            setFormData({
                date: new Date().toISOString().split('T')[0],
                studentName: '',
                courseName: '',
                status: 'Present',
                studentEmail: ''
            });
            alert('Attendance record captured successfully.');
        } catch (err) {
            alert('Failed to record attendance: ' + (err.response?.data?.message || err.message));
        }
    };

    const deleteRecord = async (id) => {
        if (window.confirm('Remove this uploaded attendance record?')) {
            try {
                await axios.delete(`/upload/performance/${id}?type=attendance`);
                setStudentRecords(studentRecords.filter(r => r._id !== id));
            } catch (err) {
                alert('Failed to delete record');
            }
        }
    };

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

    // Only show records that have attendance data
    const recordsWithAttendance = studentRecords.filter(r => r.hasAttendance);

    // Calculate overall attendance for the stats cards
    const totalAttendance = recordsWithAttendance.length > 0 
        ? Math.round(recordsWithAttendance.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / recordsWithAttendance.length) 
        : 0;

    const filteredRecords = recordsWithAttendance.filter(r =>
        (r.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.studentEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Attendance Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Subjects" value={recordsWithAttendance.length} color="text-gray-900" bg="bg-white" />
                <StatCard label="Highest Attendance" value={`${recordsWithAttendance.length > 0 ? Math.max(...recordsWithAttendance.map(r => r.attendancePercentage)) : 0}%`} color="text-emerald-500" bg="bg-white" />
                <StatCard label="Lowest Attendance" value={`${recordsWithAttendance.length > 0 ? Math.min(...recordsWithAttendance.map(r => r.attendancePercentage)) : 0}%`} color="text-red-500" bg="bg-white" />
                <div className="bg-[#9D71FD] p-8 rounded-[2.5rem] shadow-xl shadow-[#9D71FD]/20 text-white flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#9D71FD]/20 mb-2">Overall Rate</p>
                    <h3 className="text-4xl font-black">{totalAttendance}%</h3>
                </div>
            </div>

            {user.role === 'Student' ? (
                <div className="space-y-4">
                {/* Student Search Bar */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-gray-900 tracking-tighter">Attendance Overview</h2>
                        <span className="text-[10px] font-black text-[#10B981] uppercase tracking-widest bg-[#10B981]/5 px-3 py-1 rounded-full">{recordsWithAttendance.length} Subject{recordsWithAttendance.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all font-bold text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-10 h-[400px] flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-gray-900 tracking-tighter">Subject Attendance</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Attendance Percentage per Subject</p>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest animate-pulse">Loading Chart...</div>
                            ) : recordsWithAttendance.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 font-medium tracking-tight">No data available</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={recordsWithAttendance} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 900}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 900}} />
                                        <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                        <Bar dataKey="attendancePercentage" fill="#10B981" radius={[8, 8, 8, 8]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-10 h-[400px] flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-gray-900 tracking-tighter">Attendance Distribution</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Relative performance weight</p>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest animate-pulse">Loading Chart...</div>
                            ) : studentRecords.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 font-medium tracking-tight">No data available</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={studentRecords} dataKey="attendancePercentage" nameKey="subject" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                                            {studentRecords.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                        <Legend wrapperStyle={{fontSize: '10px', fontWeight: 900}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
                    <div className="p-10 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tighter">Uploaded Attendance Records</h2>
                            <span className="text-[10px] font-black text-[#10B981] uppercase tracking-widest bg-[#10B981]/5 px-3 py-1 rounded-full mt-2 inline-block">{studentRecords.length} Record{studentRecords.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="relative w-full sm:w-80">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#10B981]/20 transition-all font-bold text-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                    <th className="p-8">Upload Date</th>
                                    <th className="p-8">Student Detail</th>
                                    <th className="p-8">Subject</th>
                                    <th className="p-8 text-center">Attendance %</th>
                                    <th className="p-8 text-right">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-16 text-center text-gray-300 font-bold uppercase tracking-widest animate-pulse">Fetching Uploaded Data...</td></tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr><td colSpan="5" className="p-16 text-center text-gray-400 font-medium">{searchTerm ? 'No records match your search.' : 'No uploaded attendance records found.'}</td></tr>
                                ) : filteredRecords.map((record, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-8 font-bold text-gray-700 text-sm">{new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td className="p-8">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 text-xs">{record.studentName}</span>
                                                <span className="text-[9px] font-black text-[#9D71FD] uppercase tracking-tighter mt-1">{record.studentEmail}</span>
                                                <span className="text-[9px] font-black text-gray-400 mt-1 uppercase">Roll: {record.rollNumber}</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className="font-bold text-gray-900 text-sm bg-gray-100 px-3 py-1 rounded-lg">{record.subject}</span>
                                        </td>
                                        <td className="p-8 text-center">
                                            <span className="font-black text-[#10B981] text-lg">{record.attendancePercentage}%</span>
                                        </td>
                                        <td className="p-8 text-right">
                                            <button
                                                onClick={() => deleteRecord(record._id)}
                                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, color, bg }) => (
    <div className={`${bg} p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-xl`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className={`text-4xl font-black ${color}`}>{value}</h3>
    </div>
);

export default Attendance;
