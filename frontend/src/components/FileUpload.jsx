import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2 } from 'lucide-react';

const FileUpload = ({ 
    onFileSelect, 
    accept,
    label = "Drag & drop your file here or click to browse", 
    subLabel = "Supports all standard formats",
    icon: Icon = Upload,
    className = "",
    currentFile = null,
    onClear = null,
    theme = "auto", // "dark", "light", or "auto"
    directory = false
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onFileSelect(directory ? Array.from(files) : files[0]);
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(directory ? Array.from(files) : files[0]);
        }
        // Reset the input value so the same file can be re-selected
        e.target.value = '';
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const getFileName = () => {
        if (Array.isArray(currentFile)) return `${currentFile.length} files selected`;
        if (currentFile instanceof File) return currentFile.name;
        if (typeof currentFile === 'string' && currentFile) return currentFile;
        return 'File selected';
    };

    // Determine theme: check if parent is dark (heuristic: class contains dark bg)
    // For simplicity, expose a "theme" prop. Default behaviour: light theme (visible on white cards)
    const isDark = theme === 'dark';

    const dropZoneBase = `
        relative cursor-pointer select-none
        border-2 border-dashed rounded-2xl p-8
        transition-all duration-300 flex flex-col items-center justify-center text-center
    `;

    const dropZoneLight = isDragging
        ? 'border-[#9D71FD] bg-[#9D71FD]/5 scale-[1.01]'
        : 'border-gray-200 bg-gray-50 hover:border-[#9D71FD]/50 hover:bg-[#9D71FD]/5';

    const dropZoneDark = isDragging
        ? 'border-[#9D71FD] bg-[#9D71FD]/10 scale-[1.01]'
        : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10';

    const dropZoneStyle = isDark ? dropZoneDark : dropZoneLight;

    const iconBgLight = isDragging ? 'bg-[#9D71FD] text-white' : 'bg-gray-100 text-gray-400 group-hover:text-[#9D71FD] group-hover:bg-[#9D71FD]/10';
    const iconBgDark  = isDragging ? 'bg-[#9D71FD] text-white' : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10';

    const labelColorLight = isDragging ? 'text-[#9D71FD]' : 'text-gray-700 group-hover:text-[#9D71FD]';
    const labelColorDark  = 'text-white group-hover:text-[#9D71FD]';

    const subLabelColor = isDark ? 'text-gray-500' : 'text-gray-400';

    const fileCardStyle = isDark
        ? 'bg-white/5 border border-white/10 text-white'
        : 'bg-emerald-50 border border-emerald-200 text-gray-800';

    const fileNameColor = isDark ? 'text-white' : 'text-gray-800';
    const fileSubColor  = isDark ? 'text-emerald-400/80' : 'text-emerald-600';
    const clearBtnColor = isDark
        ? 'text-gray-500 hover:text-red-400 hover:bg-red-400/10'
        : 'text-gray-400 hover:text-red-500 hover:bg-red-50';

    return (
        <div className={`w-full ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept || undefined}
                webkitdirectory={directory ? "" : undefined}
                directory={directory ? "" : undefined}
                multiple={directory}
                className="hidden"
                tabIndex={-1}
            />

            {!currentFile ? (
                <div
                    role="button"
                    tabIndex={0}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e); }}
                    className={`group ${dropZoneBase} ${dropZoneStyle}`}
                >
                    <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center mb-4 
                        transition-all duration-300
                        ${isDark ? iconBgDark : iconBgLight}
                    `}>
                        {Icon && <Icon size={30} />}
                    </div>
                    <p className={`font-bold text-sm tracking-tight mb-1 transition-colors ${isDark ? labelColorDark : labelColorLight}`}>
                        {label}
                    </p>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${subLabelColor}`}>
                        {subLabel}
                    </p>

                    {/* Corner border indicators on drag */}
                    {isDragging && (
                        <>
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#9D71FD] rounded-tl-2xl pointer-events-none" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#9D71FD] rounded-tr-2xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#9D71FD] rounded-bl-2xl pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#9D71FD] rounded-br-2xl pointer-events-none" />
                        </>
                    )}
                </div>
            ) : (
                <div className={`rounded-2xl p-5 flex items-center justify-between gap-4 ${fileCardStyle}`}>
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 size={22} />
                        </div>
                        <div className="min-w-0">
                            <p className={`font-black text-sm tracking-tight truncate max-w-[220px] ${fileNameColor}`}>
                                {getFileName()}
                            </p>
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${fileSubColor}`}>
                                Ready for upload
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onClear) onClear();
                        }}
                        className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${clearBtnColor}`}
                        aria-label="Remove file"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
