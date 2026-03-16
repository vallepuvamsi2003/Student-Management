import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, AreaChart, Area } from 'recharts';
import { BookOpen, CalendarCheck, Award, TrendingUp, Users, Presentation, Settings, ArrowRight, Zap, GraduationCap, ClipboardList, UploadCloud } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [adminStats, setAdminStats] = useState({ totalStudents: 0, totalCourses: 0, totalFaculty: 0, attendance: 0 });
    const [studentStats, setStudentStats] = useState({ coursesEnrolled: 0, attendancePercentage: 0, averageMarks: 0, latestResult: 'N/A', uploadedAttendance: null, uploadedMarks: null });
    const [studentChartData, setStudentChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                if (user.role === 'Admin') {
                    const [sRes, cRes, fRes] = await Promise.all([
                        axios.get('/students'),
                        axios.get('/courses'),
                        axios.get('/auth/faculty-list')
                    ]);
                    setAdminStats({
                        totalStudents: sRes.data.length,
                        totalCourses: cRes.data.length,
                        totalFaculty: fRes.data.length,
                        attendance: 88 // Mock overall institutional attendance
                    });
                } else if (user.role === 'Student') {
                    const [profileRes, attRes, marksRes, uploadPerfRes] = await Promise.all([
                        axios.get('/students/profile'),
                        axios.get('/attendance/my-attendance'),
                        axios.get('/marks/my-marks'),
                        axios.get(`/upload/performance/${user.email}`).catch(() => ({ data: null }))
                    ]);

                    const profile = profileRes.data;
                    const enrolledCount = profile?.course ? 1 : 0;

                    const attendanceRecords = attRes.data;
                    const totalClasses = attendanceRecords.length;
                    const presentClasses = attendanceRecords.filter(a => a.status === 'Present').length;
                    const attPerc = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

                    const marksRecords = marksRes.data;
                    const totalMarks = marksRecords.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
                    const avgMarks = marksRecords.length > 0 ? Math.round(totalMarks / marksRecords.length) : 0;

                    const chartData = marksRecords.map(m => ({
                        subject: m.course?.courseCode || 'UKN',
                        marks: m.marksObtained,
                    }));

                    const uploadPerf = uploadPerfRes.data || [];
                    const bulkAttRecords = uploadPerf.filter(r => r.hasAttendance);
                    const bulkMarksRecords = uploadPerf.filter(r => r.hasMarks);

                    const avgUploadedAtt = bulkAttRecords.length > 0 
                        ? Math.round(bulkAttRecords.reduce((acc, curr) => acc + (parseFloat(curr.attendancePercentage) || 0), 0) / bulkAttRecords.length) 
                        : null;
                    
                    const avgUploadedMarks = bulkMarksRecords.length > 0 
                        ? Math.round(bulkMarksRecords.reduce((acc, curr) => {
                            const val = parseFloat(curr.marks);
                            return acc + (isNaN(val) ? 0 : val);
                        }, 0) / bulkMarksRecords.length) 
                        : null;

                    setStudentStats({
                        coursesEnrolled: enrolledCount,
                        attendancePercentage: attPerc,
                        averageMarks: avgMarks,
                        latestResult: avgMarks >= 40 ? 'Pass' : (marksRecords.length > 0 ? 'Fail' : 'N/A'),
                        uploadedAttendance: avgUploadedAtt,
                        uploadedMarks: avgUploadedMarks,
                        uploadedRecords: uploadPerf
                    });

                    if (bulkMarksRecords.length > 0) {
                        const uploadChartData = bulkMarksRecords.map(u => ({
                            subject: u.subject || 'UKN',
                            marks: parseFloat(u.marks) || 0,
                        }));
                        setStudentChartData(uploadChartData);
                    } else {
                        setStudentChartData(chartData);
                    }
                }
            } catch (err) {
                console.error("Dashboard error:", err);
            }
            setLoading(false);
        };
        fetchStats();
    }, [user]);

    const mockAdminChart = [
        { name: 'Mon', attendance: 85, absent: 15 },
        { name: 'Tue', attendance: 92, absent: 8 },
        { name: 'Wed', attendance: 78, absent: 22 },
        { name: 'Thu', attendance: 95, absent: 5 },
        { name: 'Fri', attendance: 89, absent: 11 },
    ];

    if (loading) return <div className="text-gray-400 font-black p-10 animate-pulse uppercase tracking-widest text-xs">Initializing Neural Link...</div>;

    return (
        <div className="space-y-10 animate-fade-in pb-16 px-2">

            {/* Ultra Modern Welcome Banner */}
            <div className="relative overflow-hidden bg-[#1B1B1E] rounded-[2.5rem] p-10 shadow-2xl border border-white/5 group">
                {/* Background Glows */}
                <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-[#9D71FD]/20 rounded-full blur-[100px] group-hover:bg-[#9D71FD]/30 transition-colors duration-1000"></div>
                <div className="absolute bottom-[-50%] left-[-10%] w-64 h-64 bg-[#38BDF8]/10 rounded-full blur-[80px]"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-3 text-center md:text-left">
                        <div className="inline-flex items-center space-x-2 bg-[#9D71FD]/20 text-[#9D71FD] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            <Zap size={14} /> <span>System Online</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                            Welcome back, <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9333EA] via-[#9D71FD] to-[#38BDF8]">{user.name}.</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-md text-lg leading-relaxed">
                            {user.role === 'Admin' ? "The institution database is fully synchronized. Overviewing 1.2k active nodes." : "Your academic progress is being tracked in real-time. Keep chasing excellence."}
                        </p>
                    </div>
                    {user.role === 'Student' && (
                        <div className="flex gap-4">
                            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[120px]">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-emerald-400 font-black text-xl">Active</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[120px]">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Rank</p>
                                <p className="text-[#38BDF8] font-black text-xl">Elite</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {user.role === 'Student' && (
                <div className="flex flex-col xl:flex-row gap-10">
                    <div className="flex-1 space-y-10">
                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-[#9D71FD] to-[#38BDF8] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-[#9D71FD]/20 group-hover:rotate-6 transition-transform">
                                    {user.name?.charAt(0)}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center">
                                    <Zap size={16} className="text-white" />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{user.name}</h1>
                                <p className="text-[#9D71FD] font-black uppercase tracking-[0.2em] text-xs mb-4">Identity: {user.referenceId || 'N/A'}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <ProfileMiniStat label="ID" value={user.referenceId?.substring(user.referenceId.length - 8).toUpperCase() || 'STD-001'} />
                                    <ProfileMiniStat label="Dept" value="CS / Eng" />
                                    <ProfileMiniStat label="Sem" value="1st Semester" />
                                    <ProfileMiniStat label="Year" value="2024 / Senior" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Statistics Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <StudentStatCard title="Attendance" value={`${studentStats.uploadedAttendance !== null ? studentStats.uploadedAttendance : studentStats.attendancePercentage}%`} sub="Presence Rate" color="text-[#38BDF8]" bg="bg-[#38BDF8]/5" icon={<CalendarCheck size={24} />} />
                            <StudentStatCard title="Marks/Grade" value={studentStats.uploadedMarks !== null ? studentStats.uploadedMarks : studentStats.averageMarks} sub="Latest Upload" color="text-[#9D71FD]" bg="bg-[#9D71FD]/5" icon={<Award size={24} />} />
                            <StudentStatCard title="Enrolled" value={studentStats.coursesEnrolled} sub="Active Courses" color="text-[#9D71FD]" bg="bg-[#9D71FD]/5" icon={<BookOpen size={24} />} />
                            <StudentStatCard title="Pending" value="03" sub="Active Tasks" color="text-red-400" bg="bg-red-400/5" icon={<ClipboardList size={24} />} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Performance Chart */}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 lg:col-span-2">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                                        <TrendingUp size={20} className="text-[#9D71FD]" /> GPA Progress Log
                                    </h2>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={studentChartData.length > 0 ? studentChartData : [{ subject: 'Sem 1', marks: 3.2 }, { subject: 'Sem 2', marks: 3.5 }, { subject: 'Sem 3', marks: 3.8 }]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorGPA" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#9D71FD" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#9D71FD" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                            <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }} />
                                            <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', shadow: 'xl', fontWeight: 'bold' }} />
                                            <Area type="monotone" dataKey="marks" stroke="#9D71FD" strokeWidth={4} fillOpacity={1} fill="url(#colorGPA)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Circular Metric */}
                            <div className="bg-[#1B1B1E] rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                                <h2 className="text-lg font-black text-white w-full mb-2 tracking-tighter italic">Institutional <span className="text-[#38BDF8]">Presence</span></h2>
                                <div className="h-64 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart
                                            cx="50%" cy="50%"
                                            innerRadius="80%" outerRadius="110%"
                                            barSize={12}
                                            data={[{ name: 'Attendance', value: studentStats.uploadedAttendance !== null ? studentStats.uploadedAttendance : (studentStats.attendancePercentage || 85), fill: '#38BDF8' }]}
                                            startAngle={225} endAngle={-45}
                                        >
                                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                            <RadialBar minAngle={15} background={{ fill: 'rgba(255,255,255,0.05)' }} clockWise dataKey="value" cornerRadius={15} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-5xl font-black text-white tracking-tighter">{studentStats.uploadedAttendance !== null ? studentStats.uploadedAttendance : (studentStats.attendancePercentage || 85)}%</span>
                                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Consistency</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Uploaded Subjects Table */}
                        {studentStats.uploadedRecords && studentStats.uploadedRecords.length > 0 && (
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mt-8">
                                <h2 className="text-xl font-black text-gray-900 tracking-tighter mb-6 flex items-center gap-2">
                                    <BookOpen size={20} className="text-[#9D71FD]" /> Subject Performance Log
                               </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Subject</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Attendance</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Marks</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentStats.uploadedRecords.map((record, index) => (
                                                <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-4 font-bold text-gray-900">{record.subject || 'N/A'}</td>
                                                    <td className="py-4 px-4 font-bold text-[#38BDF8]">{record.attendancePercentage}%</td>
                                                    <td className="py-4 px-4 font-bold text-[#9D71FD]">{record.marks}</td>
                                                    <td className="py-4 px-4 font-bold text-gray-500">{record.grade}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notification Sidebar Panel */}
                    <div className="w-full xl:w-96 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-fit space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <h2 className="text-xl font-black text-gray-900 tracking-tighter">Activity Feed</h2>
                            <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-[10px] font-black">04</div>
                        </div>
                        <div className="space-y-6">
                            <NotificationItem icon={<ClipboardList size={16} />} title="New Assignment" desc="DBMS Assignment uploaded" time="2h ago" color="bg-[#9D71FD]" />
                            <NotificationItem icon={<CalendarCheck size={16} />} title="Attendance Sync" desc="Yesterday's attendance marked" time="5h ago" color="bg-[#38BDF8]" />
                            <NotificationItem icon={<Award size={16} />} title="Grade Release" desc="Algorithms Mid-term result is out" time="1d ago" color="bg-amber-400" />
                            <NotificationItem icon={<Users size={16} />} title="Faculty Message" desc="Class rescheduled to 10:00 AM" time="2d ago" color="bg-emerald-500" />
                        </div>
                        <button className="w-full py-4 rounded-2xl bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Clear All History</button>
                    </div>
                </div>
            )}

            {user.role === 'Admin' && (
                <>
                    {/* Admin Ultra Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AdminStatCard title="Students" value={adminStats.totalStudents} sub="Node Density" icon={<Users />} theme="purple" />
                        <AdminStatCard title="Experts" value={adminStats.totalFaculty} sub="Knowledge Base" icon={<Presentation />} theme="amber" />
                        <AdminStatCard title="Modules" value={adminStats.totalCourses} sub="Active Data" icon={<BookOpen />} theme="blue" />
                        <AdminStatCard title="Presence" value={adminStats.attendance + '%'} sub="Institutional Avg" icon={<CalendarCheck />} theme="emerald" />
                    </div>

                    {/* Admin Analytic Zone */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 lg:col-span-2">
                            <h2 className="text-xl font-black text-gray-900 mb-8 tracking-tighter flex items-center gap-2">
                                <TrendingUp size={20} className="text-[#38BDF8]" /> Structural Attendance Log
                            </h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mockAdminChart} barGap={8} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }} />
                                        <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '20px', border: 'none', shadow: 'xl' }} />
                                        <Bar name="Present" dataKey="attendance" fill="#38BDF8" radius={[8, 8, 8, 8]} barSize={20} />
                                        <Bar name="Absent" dataKey="absent" fill="#E5E7EB" radius={[8, 8, 8, 8]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Admin Schedule Zone */}
                            <div className="bg-[#1B1B1E] p-8 rounded-[2.5rem] shadow-2xl space-y-8 flex flex-col">
                                <h2 className="text-lg font-black text-white flex justify-between items-center tracking-tighter">
                                    Core Agenda <Settings size={18} className="text-gray-500" />
                                </h2>
                                <div className="space-y-6 flex-1">
                                    <AgendaItem time="08:00 AM" title="Homeroom Protocol" color="bg-purple-500" />
                                    <AgendaItem time="10:30 AM" title="Infrastructure Audit" color="bg-amber-400" />
                                </div>
                            </div>

                        <BulkUploadQuickLink navigate={navigate} />
                    </div>
                </>
            )}

            {user.role === 'Faculty' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <div className="bg-white p-16 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center">
                                <Presentation size={40} />
                            </div>
                        </div>
                        <div className="text-center relative z-10 space-y-6">
                            <div className="w-24 h-24 bg-[#9D71FD]/10 text-[#9D71FD] rounded-[2rem] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                <GraduationCap size={44} />
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Educator Portal</h2>
                            <p className="text-gray-500 text-lg font-medium max-w-sm mx-auto">Access your specialized tools via the secure sidebar navigation.</p>
                            <div className="flex gap-4 justify-center">
                                <div className="px-6 py-2 bg-gray-50 rounded-full text-xs font-black text-gray-400 uppercase tracking-widest border border-gray-100">Live Sync</div>
                                <div className="px-6 py-2 bg-gray-50 rounded-full text-xs font-black text-gray-400 uppercase tracking-widest border border-gray-100">Role: Expert</div>
                            </div>
                        </div>
                        {/* Background abstract */}
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gray-50 rounded-full -z-0"></div>
                    </div>
                    
                    <BulkUploadQuickLink navigate={navigate} />
                </div>
            )}
        </div>
    );
};

const StudentStatCard = ({ title, value, sub, color, bg, icon }) => (
    <div className={`bg-white p-8 rounded-[2.2rem] shadow-sm border border-gray-50 transition-all hover:-translate-y-2 hover:shadow-xl group`}>
        <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">{value}</h3>
        <p className={`text-base font-bold ${color} tracking-tight`}>{title}</p>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">{sub}</p>
    </div>
);

const AdminStatCard = ({ title, value, sub, theme, icon }) => {
    const themes = {
        purple: { color: 'text-[#9D71FD]', bg: 'bg-[#9D71FD]/5' },
        amber: { color: 'text-amber-500', bg: 'bg-amber-500/5' },
        blue: { color: 'text-[#38BDF8]', bg: 'bg-[#38BDF8]/5' },
        emerald: { color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
    };
    const current = themes[theme] || themes.purple;

    return (
        <div className="bg-white p-8 rounded-[2.2rem] shadow-sm border border-gray-50 transition-all hover:-translate-y-2 hover:shadow-xl group">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl ${current.bg} ${current.color} flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                    {icon}
                </div>
            </div>
            <h3 className={`text-4xl font-black ${current.color} tracking-tighter mb-1`}>{value}</h3>
            <p className="text-lg font-black text-gray-800 tracking-tight">{title}</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">{sub}</p>
        </div>
    );
};

const AgendaItem = ({ time, title, color }) => (
    <div className="flex items-center space-x-4 group cursor-default">
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest w-20">{time}</div>
        <div className="flex-1 flex items-center space-x-3">
            <div className={`w-1.5 h-6 rounded-full ${color} opacity-40 group-hover:opacity-100 transition-opacity`}></div>
            <p className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{title}</p>
        </div>
    </div>
);

const ProfileMiniStat = ({ label, value }) => (
    <div className="bg-gray-50/50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px] border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-xs font-black text-gray-900 tracking-tight text-center truncate w-full">{value}</span>
    </div>
);

const NotificationItem = ({ icon, title, desc, time, color }) => (
    <div className="flex items-start space-x-4 group cursor-pointer hover:bg-gray-50/50 p-3 rounded-2xl transition-all">
        <div className={`w-10 h-10 ${color} bg-opacity-10 ${color.replace('bg-', 'text-')} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-gray-900 tracking-tight truncate">{title}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">{desc}</p>
            <span className="text-[9px] font-black text-[#9D71FD] uppercase tracking-widest mt-1 inline-block">{time}</span>
        </div>
    </div>
);

const BulkUploadQuickLink = ({ navigate }) => (
    <div className="bg-gradient-to-br from-[#1B1B1E] to-[#2D2D35] p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-center text-left relative overflow-hidden group border border-white/5 hover:border-white/10 transition-all cursor-pointer"
        onClick={() => navigate('/dashboard/bulk-upload')}
    >
        <div className="absolute bottom-[-50%] right-[-10%] w-64 h-64 bg-[#38BDF8]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#38BDF8]/20 transition-all duration-700" />
        <h2 className="text-xl font-black text-white w-full tracking-tighter mb-2 flex items-center gap-2">
            <UploadCloud size={24} className="text-[#38BDF8]" /> Bulk <span className="text-[#38BDF8]">Upload</span> Data
        </h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed font-medium">
            Upload student <span className="text-white">Attendance</span> and <span className="text-white">Marks</span> via CSV or Excel — matched by email identity.
        </p>
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#9333EA] to-[#38BDF8] text-white py-4 px-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] w-full justify-center group-hover:shadow-lg group-hover:shadow-[#9333EA]/30 group-hover:scale-[1.02] transition-all">
            <UploadCloud size={16} /> Go to Bulk Upload
        </div>
    </div>
);

export default Dashboard;
