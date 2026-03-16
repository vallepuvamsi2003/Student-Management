import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    UploadCloud, FileSpreadsheet, CheckCircle, XCircle,
    AlertCircle, Info, ChevronDown, ChevronUp, Users, CalendarCheck, Award
} from 'lucide-react';
import FileUpload from '../components/FileUpload';

const BulkUpload = () => {
    const { user } = useAuth();

    // Attendance upload state
    const [attFile, setAttFile] = useState(null);
    const [attUploading, setAttUploading] = useState(false);
    const [attResult, setAttResult] = useState(null);

    // Marks upload state
    const [marksFile, setMarksFile] = useState(null);
    const [marksUploading, setMarksUploading] = useState(false);
    const [marksResult, setMarksResult] = useState(null);

    // Instructions accordion
    const [showInstructions, setShowInstructions] = useState(false);

    const handleAttUpload = async (e) => {
        e.preventDefault();
        if (!attFile) return alert('Please select a CSV or Excel file first.');
        const formData = new FormData();
        formData.append('file', attFile);
        setAttUploading(true);
        setAttResult(null);
        try {
            const res = await axios.post('/upload/student-data', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAttResult({
                success: true,
                message: `✓ Successfully processed ${res.data.recordsCount || 0} attendance record(s).`
            });
            setAttFile(null);
        } catch (err) {
            setAttResult({
                success: false,
                message: err.response?.data?.message || 'Upload failed. Please check your file format.'
            });
        }
        setAttUploading(false);
    };

    const handleMarksUpload = async (e) => {
        e.preventDefault();
        if (!marksFile) return alert('Please select a CSV or Excel file first.');
        const formData = new FormData();
        formData.append('file', marksFile);
        setMarksUploading(true);
        setMarksResult(null);
        try {
            const res = await axios.post('/upload/student-data', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMarksResult({
                success: true,
                message: `✓ Successfully processed ${res.data.recordsCount || 0} marks record(s).`
            });
            setMarksFile(null);
        } catch (err) {
            setMarksResult({
                success: false,
                message: err.response?.data?.message || 'Upload failed. Please check your file format.'
            });
        }
        setMarksUploading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-16">

            {/* Page Header Banner */}
            <div className="relative overflow-hidden bg-[#1B1B1E] rounded-[2.5rem] p-10 shadow-2xl border border-white/5">
                <div className="absolute top-[-40%] right-[-5%] w-72 h-72 bg-[#38BDF8]/15 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-40%] left-[-5%] w-56 h-56 bg-[#9D71FD]/15 rounded-full blur-[80px]" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr from-[#9333EA] to-[#38BDF8] flex items-center justify-center shadow-2xl shadow-[#9D71FD]/30 flex-shrink-0">
                        <UploadCloud size={38} className="text-white" />
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 bg-[#38BDF8]/10 text-[#38BDF8] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                            <FileSpreadsheet size={12} /> Data Injection Module
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                            Bulk <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D71FD] to-[#38BDF8]">Upload</span> Data
                        </h1>
                        <p className="text-gray-400 font-medium max-w-lg text-base leading-relaxed">
                            Upload student <span className="text-white font-bold">Attendance</span> and <span className="text-white font-bold">Marks</span> via CSV or Excel — matched to students by email identity.
                        </p>
                    </div>
                    <div className="ml-auto hidden lg:flex gap-3">
                        <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Role</p>
                            <p className="text-white font-black text-sm">{user.role}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-emerald-400 font-black text-sm">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSV Format Instructions */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
                <button
                    onClick={() => setShowInstructions(v => !v)}
                    className="w-full p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                            <Info size={20} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-base font-black text-gray-900 tracking-tight">File Format Instructions</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Required CSV / Excel columns for upload</p>
                        </div>
                    </div>
                    {showInstructions ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
                </button>
                {showInstructions && (
                    <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50 pt-6 animate-fade-in">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-4">
                                <CalendarCheck size={16} className="text-[#38BDF8]" />
                                <h4 className="font-black text-gray-800 text-sm uppercase tracking-widest">Attendance Columns</h4>
                            </div>
                            {[
                                { col: 'studentEmail', desc: 'Student email (required for matching)' },
                                { col: 'studentName', desc: 'Full name of the student' },
                                { col: 'rollNumber', desc: 'Roll/Registration number' },
                                { col: 'subject', desc: 'Subject or course name' },
                                { col: 'attendancePercentage', desc: 'Attendance % (e.g. 85)' },
                            ].map(({ col, desc }) => (
                                <div key={col} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl">
                                    <code className="text-[10px] font-black text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-1 rounded-lg flex-shrink-0">{col}</code>
                                    <span className="text-xs font-medium text-gray-500">{desc}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-4">
                                <Award size={16} className="text-[#9D71FD]" />
                                <h4 className="font-black text-gray-800 text-sm uppercase tracking-widest">Marks Columns</h4>
                            </div>
                            {[
                                { col: 'studentEmail', desc: 'Student email (required for matching)' },
                                { col: 'studentName', desc: 'Full name of the student' },
                                { col: 'rollNumber', desc: 'Roll/Registration number' },
                                { col: 'subject', desc: 'Subject or course name' },
                                { col: 'marks', desc: 'Marks obtained (e.g. 78)' },
                                { col: 'grade', desc: 'Letter grade (e.g. A, B+)' },
                            ].map(({ col, desc }) => (
                                <div key={col} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl">
                                    <code className="text-[10px] font-black text-[#9D71FD] bg-[#9D71FD]/10 px-2 py-1 rounded-lg flex-shrink-0">{col}</code>
                                    <span className="text-xs font-medium text-gray-500">{desc}</span>
                                </div>
                            ))}
                        </div>
                        <div className="md:col-span-2 bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-amber-700 leading-relaxed">
                                Both Attendance and Marks can be included in the <strong>same file</strong> with all columns combined. Students are matched by <strong>studentEmail</strong>. Emails not found in the system will be skipped.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Attendance Upload */}
                <div className="bg-gradient-to-br from-[#1B1B1E] to-[#23232C] rounded-[2.5rem] shadow-2xl p-10 flex flex-col gap-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                    <div className="absolute bottom-0 right-0 w-56 h-56 bg-[#38BDF8]/10 rounded-full blur-[60px] group-hover:bg-[#38BDF8]/20 transition-colors duration-700 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center">
                                <CalendarCheck size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tighter">Attendance <span className="text-[#38BDF8]">Upload</span></h2>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">CSV / Excel · Email Matched</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed mt-2 mb-6">
                            Upload student attendance records by spreadsheet. The system maps each row to a student profile using their email address.
                        </p>
                        <form onSubmit={handleAttUpload} className="flex flex-col gap-5">
                            <FileUpload
                                onFileSelect={(file) => setAttFile(file)}
                                accept=".csv,.xlsx"
                                currentFile={attFile}
                                onClear={() => setAttFile(null)}
                                label="Drop attendance sheet here"
                                subLabel="Supports .CSV and .XLSX"
                                icon={UploadCloud}
                                theme="dark"
                            />
                            <button
                                id="att-upload-btn"
                                type="submit"
                                disabled={attUploading || !attFile}
                                className={`w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3
                                    ${attUploading || !attFile
                                        ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white hover:shadow-xl hover:shadow-[#38BDF8]/30 hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                <UploadCloud size={16} />
                                {attUploading ? 'Processing Attendance...' : 'Upload Attendance Data'}
                            </button>
                        </form>
                        {attResult && (
                            <div className={`mt-4 p-4 rounded-2xl border text-xs font-black uppercase tracking-widest text-center animate-fade-in flex items-center justify-center gap-2
                                ${attResult.success
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                            >
                                {attResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                {attResult.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Marks Upload */}
                <div className="bg-gradient-to-br from-[#1B1B1E] to-[#23232C] rounded-[2.5rem] shadow-2xl p-10 flex flex-col gap-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                    <div className="absolute bottom-0 right-0 w-56 h-56 bg-[#9D71FD]/10 rounded-full blur-[60px] group-hover:bg-[#9D71FD]/20 transition-colors duration-700 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-[#9D71FD]/15 text-[#9D71FD] flex items-center justify-center">
                                <Award size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tighter">Marks & Grades <span className="text-[#9D71FD]">Upload</span></h2>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">CSV / Excel · Email Matched</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed mt-2 mb-6">
                            Upload student marks and letter grades by spreadsheet. Each entry is linked to the correct student using their email identity.
                        </p>
                        <form onSubmit={handleMarksUpload} className="flex flex-col gap-5">
                            <FileUpload
                                onFileSelect={(file) => setMarksFile(file)}
                                accept=".csv,.xlsx"
                                currentFile={marksFile}
                                onClear={() => setMarksFile(null)}
                                label="Drop marks sheet here"
                                subLabel="Supports .CSV and .XLSX"
                                icon={UploadCloud}
                                theme="dark"
                            />
                            <button
                                id="marks-upload-btn"
                                type="submit"
                                disabled={marksUploading || !marksFile}
                                className={`w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3
                                    ${marksUploading || !marksFile
                                        ? 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#9333EA] to-[#9D71FD] text-white hover:shadow-xl hover:shadow-[#9D71FD]/30 hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                <UploadCloud size={16} />
                                {marksUploading ? 'Processing Marks...' : 'Upload Marks & Grades'}
                            </button>
                        </form>
                        {marksResult && (
                            <div className={`mt-4 p-4 rounded-2xl border text-xs font-black uppercase tracking-widest text-center animate-fade-in flex items-center justify-center gap-2
                                ${marksResult.success
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                            >
                                {marksResult.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                {marksResult.message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Combined Upload Card */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-tr from-[#9333EA] to-[#38BDF8] rounded-2xl flex items-center justify-center shadow-lg shadow-[#9D71FD]/20">
                        <Users size={22} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tighter">Combined Data Upload</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Upload both Attendance + Marks in one sheet</p>
                    </div>
                </div>
                <CombinedUpload />
            </div>
        </div>
    );
};

const CombinedUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please select a file first.');
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        setResult(null);
        try {
            const res = await axios.post('/upload/student-data', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult({
                success: true,
                message: `✓ Successfully injected ${res.data.recordsCount || 0} student record(s) into the system.`
            });
            setFile(null);
        } catch (err) {
            setResult({
                success: false,
                message: err.response?.data?.message || 'Upload failed. Verify your file format and try again.'
            });
        }
        setUploading(false);
    };

    return (
        <form onSubmit={handleUpload} className="flex flex-col gap-6">
            <FileUpload
                onFileSelect={(file) => setFile(file)}
                accept=".csv,.xlsx"
                currentFile={file}
                onClear={() => setFile(null)}
                label="Drop your combined data sheet here"
                subLabel="All columns (Attendance + Marks) in a single .CSV or .XLSX file"
                icon={UploadCloud}
                theme="light"
            />
            <button
                id="combined-upload-btn"
                type="submit"
                disabled={uploading || !file}
                className={`w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3
                    ${uploading || !file
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#9333EA] to-[#38BDF8] text-white hover:shadow-xl hover:shadow-[#9D71FD]/30 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
            >
                <UploadCloud size={16} />
                {uploading ? 'Processing Data...' : 'Start Data Injection'}
            </button>
            {result && (
                <div className={`p-4 rounded-2xl border text-xs font-black uppercase tracking-widest text-center animate-fade-in flex items-center justify-center gap-2
                    ${result.success
                        ? 'bg-emerald-500/10 border-emerald-100 text-emerald-600'
                        : 'bg-red-500/10 border-red-100 text-red-500'}`}
                >
                    {result.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {result.message}
                </div>
            )}
        </form>
    );
};

export default BulkUpload;
