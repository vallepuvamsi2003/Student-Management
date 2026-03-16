import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Upload, Download, Plus, Calendar, FileText, CheckCircle, Trash2, FilePlus, Search } from 'lucide-react';
import FileUpload from '../components/FileUpload';

const Assignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [submittingId, setSubmittingId] = useState(null);
    const [solutionFile, setSolutionFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        courseName: '',
        description: '',
        deadline: '',
        filePath: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [asRes, coRes] = await Promise.all([
                    axios.get('/assignments'),
                    axios.get('/courses')
                ]);
                setAssignments(asRes.data);
                setCourses(coRes.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('courseName', formData.courseName);
        data.append('deadline', formData.deadline);
        data.append('description', formData.description);
        if (formData.file) {
            data.append('file', formData.file);
        }

        try {
            await axios.post('/assignments', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const res = await axios.get('/assignments');
            setAssignments(res.data);
            setFormData({ title: '', courseName: '', description: '', deadline: '', filePath: '', file: null });
            alert('Assignment uploaded successfully!');
        } catch (err) {
            alert('Failed to upload assignment');
        }
    };

    const handleFileUpload = async (assignmentId) => {
        if (!solutionFile) return alert('Please select a file first.');
        const data = new FormData();
        data.append('file', solutionFile);

        try {
            await axios.post(`/assignments/submit/${assignmentId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Solution submitted successfully!');
            setSubmittingId(null);
            setSolutionFile(null);
        } catch (err) {
            alert('Failed to submit solution');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await axios.delete(`/assignments/${id}`);
                setAssignments(assignments.filter(a => a._id !== id));
                alert('Assignment removed.');
            } catch (err) {
                alert('Failed to delete assignment');
            }
        }
    };

    const handleDownload = (assignment) => {
        const content = `Assignment Task\nTitle: ${assignment.title}\nCourse: ${assignment.course?.courseName || 'General'}\nDeadline: ${new Date(assignment.deadline).toLocaleDateString()}\n\nDescription: ${assignment.description}\n\nThis task paper has been downloaded from the Student portal.`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${assignment.title.replace(/\s+/g, '_')}_Task.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert(`Downloaded: ${assignment.title} task paper saved to your device.`);
    };

    const filteredAssignments = assignments.filter(a =>
        (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.course?.courseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-fade-in pb-16">
            {(user.role === 'Faculty' || user.role === 'Admin') && (
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 bg-purple-50 text-[#9D71FD] rounded-xl flex items-center justify-center">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tighter">New Assignment</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Post a new task for your students</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none font-bold text-gray-700"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Assignment Title"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Name</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none font-bold text-gray-700"
                                value={formData.courseName}
                                onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                                placeholder="e.g. Computer Science"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deadline</label>
                            <input
                                type="date"
                                className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none font-bold text-gray-700"
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                required
                            />
                        </div>
                        <div className="md:col-span-4 space-y-2 mt-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Test Paper / Task Document</label>
                            <FileUpload 
                                 onFileSelect={(file) => setFormData({ ...formData, filePath: file.name, file: file })}
                                 currentFile={formData.filePath}
                                 onClear={() => setFormData({ ...formData, filePath: '', file: null })}
                                 label="Drop the assignment file here"
                                 subLabel="PDF, DOCX components supported"
                                 icon={FilePlus}
                                 theme="light"
                             />
                        </div>
                        <div className="md:col-span-4 flex gap-4">
                            <button type="submit" className="flex-1 bg-[#9D71FD] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#9D71FD]/20 active:scale-95 transition-all">Upload Task</button>
                        </div>
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea
                                className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none font-bold text-gray-700 h-24"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Task details and instructions..."
                            />
                        </div>
                    </form>
                </div>
            )}

            {/* Assignments Search Header */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tighter">Recorded Assignments</h2>
                    <span className="text-[10px] font-black text-[#9D71FD] uppercase tracking-widest bg-[#9D71FD]/5 px-3 py-1 rounded-full mt-2 inline-block">{assignments.length} Assignment{assignments.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search assignments..."
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#9D71FD]/20 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-3 p-16 text-center text-gray-300 font-bold uppercase tracking-widest animate-pulse">Loading Assignments...</div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="col-span-3 p-16 text-center text-gray-400 font-medium">{searchTerm ? 'No assignments match your search.' : 'No assignments posted yet.'}</div>
                ) : filteredAssignments.map(ass => (
                    <div key={ass._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-purple-50 text-[#9D71FD] rounded-2xl flex items-center justify-center">
                                <ClipboardList size={24} />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1 rounded-full">
                                    Due: {new Date(ass.deadline).toLocaleDateString()}
                                </span>
                                {(user.role === 'Faculty' || user.role === 'Admin') && (
                                    <button onClick={() => handleDelete(ass._id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-1">{ass.title}</h3>
                        <p className="text-[10px] font-black text-[#9D71FD] uppercase tracking-[0.2em] mb-4">{ass.course?.courseName}</p>
                        <p className="text-gray-500 text-sm font-medium mb-6 flex-1 line-clamp-3">{ass.description}</p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleDownload(ass)}
                                className="flex-1 bg-gray-50 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                            >
                                <Download size={16} /> Task
                            </button>
                        {user.role === 'Student' && submittingId !== ass._id && (
                            <button 
                                onClick={() => setSubmittingId(ass._id)} 
                                className="w-full bg-[#38BDF8] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0EA5E9] shadow-lg shadow-[#38BDF8]/20 transition-all mt-4"
                            >
                                <Upload size={16} /> Submit Solution
                            </button>
                        )}

                        {user.role === 'Student' && submittingId === ass._id && (
                            <div className="mt-6 space-y-4 animate-fade-in">
                                <FileUpload 
                                    onFileSelect={(file) => setSolutionFile(file)}
                                    currentFile={solutionFile}
                                    onClear={() => setSolutionFile(null)}
                                    label="Drop solution here"
                                    subLabel="Max 10MB"
                                    theme="light"
                                />
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleFileUpload(ass._id)}
                                        disabled={!solutionFile}
                                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${!solutionFile ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}
                                    >
                                        Push Solution
                                    </button>
                                    <button 
                                        onClick={() => { setSubmittingId(null); setSolutionFile(null); }}
                                        className="px-4 py-2.5 bg-gray-50 text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Assignments;
