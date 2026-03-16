import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Download, Plus, Video, FileText, Layout, Hash, BookOpen, Trash2, Library, Search } from 'lucide-react';
import FileUpload from '../components/FileUpload';

const Materials = () => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFolder, setExpandedFolder] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        courseName: '',
        type: 'PDF',
        filePath: '',
        file: null, // Added missing single file state
        files: [] // For folder uploads
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [matRes, coRes] = await Promise.all([
                    axios.get('/materials'),
                    axios.get('/courses')
                ]);
                setMaterials(matRes.data);
                setCourses(coRes.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleCreateMaterial = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('courseName', formData.courseName);
        data.append('type', formData.type);
        
        if (formData.files && formData.files.length > 0) {
            formData.files.forEach(f => data.append('file', f));
        } else if (formData.file) {
            data.append('file', formData.file);
        }

        setIsUploading(true);
        try {
            console.log("Starting upload request...");
            await axios.post('/materials', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 1200000 // 20 minute timeout for massive folders
            });
            console.log("Upload request completed. Refreshing list...");
            const res = await axios.get('/materials');
            setMaterials(res.data);
            setFormData({ title: '', courseName: '', type: 'PDF', filePath: '', file: null, files: [] });
            alert('Material uploaded successfully!');
        } catch (err) {
            console.error('Upload error:', err);
            const errMsg = err.response?.data?.message || err.message || 'Check connection or file size';
            alert(`Failed to upload material: ${errMsg}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this resource?')) {
            try {
                await axios.delete(`/materials/${id}`);
                setMaterials(materials.filter(m => m._id !== id));
                alert('Resource removed.');
            } catch (err) {
                alert('Failed to delete material');
            }
        }
    };

    const handleDownload = async (filename, serverPath) => {
        if (!serverPath) {
            alert("No file path found for download.");
            return;
        }

        try {
            // Fetch real file from server
            const response = await axios.get(`http://localhost:5000/uploads/${serverPath}`, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            alert('Could not download the file from server.');
        }
    };

    const filteredMaterials = materials.filter(m =>
        (m.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.course?.courseCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.course?.courseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-fade-in pb-16">
            {(user.role === 'Faculty' || user.role === 'Admin') && (
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tighter">New Material</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Share knowledge resources with students</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateMaterial} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none font-bold text-gray-700"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Lecture Notes 01"
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
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">File Type</label>
                            <select
                                className="w-full bg-gray-50 border-none p-4 rounded-2xl outline-none font-bold text-gray-700 font-black uppercase tracking-widest text-[10px]"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option value="PDF">PDF Document</option>
                                <option value="PPT">PPT Presentation</option>
                                <option value="Video">Video Link</option>
                                <option value="Note">General Note</option>
                                <option value="Folder">Folder Upload</option>
                            </select>
                        </div>
                        <div className="md:col-span-4 space-y-2 mt-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Knowledge Component</label>
                             <FileUpload 
                                 onFileSelect={(selection) => {
                                     if (Array.isArray(selection) && selection.length > 0) {
                                         // Auto-switch to Folder type if multiple files detected
                                         setFormData({ 
                                             ...formData, 
                                             filePath: `${selection.length} files selected`, 
                                             files: selection,
                                             type: selection.length > 1 ? 'Folder' : formData.type 
                                         });
                                     } else if (selection && !Array.isArray(selection)) {
                                         setFormData({ ...formData, filePath: selection.name, file: selection, files: [] });
                                     }
                                 }}
                                 currentFile={formData.files.length > 0 ? formData.files : formData.filePath}
                                 onClear={() => setFormData({ ...formData, filePath: '', file: null, files: [] })}
                                 label={formData.type === 'Folder' ? "Drop your FOLDER here" : "Drop resource file here"}
                                 subLabel={formData.type === 'Folder' ? "All files in folder will be uploaded" : "Videos, PDFs, and Slides supported"}
                                 icon={formData.type === 'Folder' ? Library : Library}
                                 theme="light"
                                 directory={formData.type === 'Folder'}
                             />
                        </div>
                        <div className="md:col-span-4 mt-2">
                             <button 
                                 type="submit" 
                                 disabled={isUploading}
                                 className={`w-full py-4 rounded-[1.5rem] font-black shadow-lg transition-all active:scale-95 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 text-white shadow-emerald-500/20'}`}
                             >
                                 {isUploading ? 'Uploading Folder...' : 'Upload Resource'}
                             </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
                <div className="p-10 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tighter">Recorded Materials</h2>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full mt-2 inline-block">{materials.length} Resource{materials.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-8">File Name</th>
                                <th className="p-8">Course</th>
                                <th className="p-8">Type</th>
                                <th className="p-8">Date</th>
                                <th className="p-8 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-16 text-center text-gray-300 font-bold uppercase tracking-widest animate-pulse">Fetching Resources...</td></tr>
                            ) : filteredMaterials.length === 0 ? (
                                <tr><td colSpan="5" className="p-16 text-center text-gray-400 font-medium">{searchTerm ? 'No records match your search.' : 'No materials recorded yet.'}</td></tr>
                            ) : filteredMaterials.map(mat => (
                                <React.Fragment key={mat._id}>
                                    <tr 
                                        onClick={() => mat.isFolder && setExpandedFolder(expandedFolder === mat._id ? null : mat._id)}
                                        className={`hover:bg-gray-50/20 transition-colors group ${mat.isFolder ? 'cursor-pointer' : ''}`}
                                    >
                                        <td className="p-8">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${mat.isFolder ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-400 group-hover:bg-[#9D71FD]/10 group-hover:text-[#9D71FD]'}`}>
                                                    {mat.type === 'Video' ? <Video size={18} /> : (mat.isFolder ? <Library size={18} /> : <FileText size={18} />)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-700">{mat.title}</span>
                                                    {mat.isFolder && <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-0.5">{mat.files?.length || 0} files – Click to view</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className="text-[10px] font-black text-[#38BDF8] uppercase tracking-widest bg-[#38BDF8]/5 px-3 py-1 rounded-full">{mat.course?.courseCode}</span>
                                        </td>
                                        <td className="p-8">
                                            <span className="text-xs font-bold text-gray-400">{mat.type}</span>
                                        </td>
                                        <td className="p-8">
                                            <span className="text-xs font-bold text-gray-400">{new Date(mat.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {!mat.isFolder && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDownload(mat.title, mat.filePath); }}
                                                        className="p-3 text-[#38BDF8] bg-[#38BDF8]/5 hover:bg-[#38BDF8] hover:text-white rounded-xl transition-all"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                )}
                                                {(user.role === 'Faculty' || user.role === 'Admin') && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(mat._id); }}
                                                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {mat.isFolder && expandedFolder === mat._id && (
                                        <tr className="bg-gray-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <td colSpan="5" className="p-8 pt-0">
                                                <div className="ml-14 bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                                                    {mat.files?.map((file, idx) => (
                                                        <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                                            <div className="flex items-center gap-4">
                                                                <FileText size={16} className="text-gray-300" />
                                                                <span className="text-sm font-bold text-gray-600">{file.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDownload(file.name, file.path)}
                                                                className="p-2.5 text-emerald-500 bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                                                            >
                                                                <Download size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Materials;
