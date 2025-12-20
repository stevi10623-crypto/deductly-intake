'use client'

import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react'
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
                        <>
                            <div className="p-3 bg-neutral-900 rounded-full">
                                <Upload size={20} className="text-neutral-400" />
                            </div>
                            <p className="text-sm font-medium text-neutral-300">Upload {label}</p>
                            <p className="text-xs text-neutral-500">Drag & drop or click to select</p>
                        </>
                    )}
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-md p-3"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <File size={16} className="text-neutral-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{file.name}</p>
                                    <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
                                </div>
                                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                            </div>
                            <button
                                onClick={() => handleDelete(file.path)}
                                className="ml-2 p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-red-500"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

