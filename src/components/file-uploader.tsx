'use client'

import { Upload, File, X, CheckCircle, Loader2, FileText, ExternalLink, Trash2 } from 'lucide-react'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UploadedFile {
    name: string
    path: string
    size: number
}

export function FileUploader({
    label,
    token,
    section,
    initialFiles = [],
    onFilesChange
}: {
    label: string;
    token: string;
    section: string;
    initialFiles?: UploadedFile[];
    onFilesChange?: (files: UploadedFile[]) => void;
}) {
    const [files, setFiles] = useState<UploadedFile[]>(initialFiles)
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleFiles = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return

        setUploading(true)
        const newFiles: UploadedFile[] = []

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i]
            const timestamp = Date.now()
            const safeName = file.name.replace(/[^\x00-\x7F]/g, "")
            const filePath = `${token}/${section}/${timestamp}-${safeName}`

            try {
                const { data, error } = await supabase.storage
                    .from('intake-documents')
                    .upload(filePath, file)

                if (error) throw error

                newFiles.push({
                    name: file.name,
                    path: data.path,
                    size: file.size,
                })
            } catch (err: any) {
                console.error("Upload error:", err.message)
                alert(`Failed to upload ${file.name}`)
            }
        }

        const updatedFiles = [...files, ...newFiles]
        setFiles(updatedFiles)
        onFilesChange?.(updatedFiles)
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
    }

    const handleDelete = async (path: string) => {
        try {
            const { error } = await supabase.storage
                .from('intake-documents')
                .remove([path])

            if (error) throw error

            const updatedFiles = files.filter(f => f.path !== path)
            setFiles(updatedFiles)
            onFilesChange?.(updatedFiles)
        } catch (err: any) {
            console.error("Delete error:", err.message)
            alert("Failed to delete file.")
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        handleFiles(e.dataTransfer.files)
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div className="space-y-3">
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-neutral-700 hover:bg-neutral-900/50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    title="Hidden File Input"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                />
                <div className="flex flex-col items-center gap-2">
                    {uploading ? (
                        <>
                            <Loader2 size={20} className="text-blue-500 animate-spin" />
                            <p className="text-sm font-medium text-neutral-300">Uploading...</p>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <label htmlFor="file-input" className="text-sm font-medium text-neutral-300">Add documents</label>
                            <input
                                id="file-input"
                                type="file"
                                title="Upload Documents"
                                multiple
                                onChange={(e) => handleFiles(e.target.files)} // Corrected to pass FileList
                                disabled={uploading}
                                className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 transition-colors cursor-pointer disabled:opacity-50"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" // Added accept attribute back
                            />
                        </div>
                    )}
                </div>

                {/* Documents List */}
                <div className="space-y-2 mt-6">
                    <h4 className="text-sm font-medium text-neutral-400 px-1">Uploaded Files</h4>
                    <div className="space-y-2">
                        {files.length > 0 ? files.map((doc: UploadedFile) => ( // Changed 'documents' to 'files' and added type
                            <div key={doc.path} className="flex items-center justify-between p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-blue-600/10 text-blue-500 rounded">
                                        <FileText size={18} />
                                    </div>
                                    <span className="text-sm text-white truncate">{doc.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => window.open(supabase.storage.from('intake-documents').getPublicUrl(doc.path).data.publicUrl, '_blank')}
                                        title={`View ${doc.name}`}
                                        className="text-neutral-500 hover:text-white transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.path)}
                                        title={`Delete ${doc.name}`}
                                        className="text-neutral-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-6 border border-dashed border-neutral-800 rounded-md">
                                <p className="text-sm text-neutral-600">No documents uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
