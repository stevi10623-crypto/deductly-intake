'use client'

import { useState, useCallback } from 'react'
import { INTAKE_SECTIONS, getActiveSections, type FieldDefinition } from '@/lib/rules-engine'
import { saveIntakeData, submitIntake } from '@/lib/intake-client'

import { ChevronRight, ChevronLeft, Save, Plus, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileUploader } from '@/components/file-uploader'

export default function IntakeWizard({ token, initialData = {} }: { token: string, initialData?: Record<string, any> }) {
    const [data, setData] = useState(initialData)
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const activeSections = getActiveSections(data)

    // Ensure index is valid if sections change (e.g. switching to Personal Only)
    const safeStepIndex = Math.min(currentStepIndex, activeSections.length > 0 ? activeSections.length - 1 : 0)
    const currentSection = activeSections[safeStepIndex] || activeSections[0]

    // Autosave... (debouncedSave logic)
    const debouncedSave = useCallback(async (newData: Record<string, any>) => {
        setIsSaving(true)
        await saveIntakeData(token, newData)
        setIsSaving(false)
        setLastSaved(new Date())
    }, [token])

    const handleFieldChange = (id: string, value: any) => {
        const newData = { ...data, [id]: value }
        setData(newData)
        debouncedSave(newData)
    }

    const handleSubmit = async () => {
        const result = await submitIntake(token)
        if (result.success) {
            alert('Thank you! Your tax intake has been submitted successfully.')
        } else {
            alert('There was an error submitting your intake. Please try again.')
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            {/* Header, Progress, Gating Question... */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">{currentSection?.title}</h1>
                    <p className="text-neutral-400">{currentSection?.description}</p>
                </div>
                {isSaving && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Save className="animate-pulse" size={14} />
                        Saving...
                    </div>
                )}
                {lastSaved && !isSaving && (
                    <div className="text-sm text-green-600">
                        Saved
                    </div>
                )}
            </div>

            <div className="mb-8 h-1 bg-neutral-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((safeStepIndex + 1) / activeSections.length) * 100}%` }}
                />
            </div>

            {currentSection?.gatingQuestion && (
                <div className="mb-8 p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-4">{currentSection.gatingQuestion.text}</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleFieldChange(currentSection.gatingQuestion!.id, true)}
                            className={cn(
                                "px-4 py-2 rounded-md border text-sm font-medium transition-colors",
                                data[currentSection.gatingQuestion!.id] === true
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                            )}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => handleFieldChange(currentSection.gatingQuestion!.id, false)}
                            className={cn(
                                "px-4 py-2 rounded-md border text-sm font-medium transition-colors",
                                data[currentSection.gatingQuestion!.id] === false
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                            )}
                        >
                            No
                        </button>
                    </div>
                </div>
            )}

            {currentSection?.fields && (!currentSection.gatingQuestion || data[currentSection.gatingQuestion.id] === true) && (
                <div className="space-y-6 mb-12">
                    {currentSection.fields.map(field => {
                        // Check showIf logic
                        if (field.showIf) {
                            if (data[field.showIf.field] !== field.showIf.value) return null;
                        }

                        return (
                            <FormField
                                key={field.id}
                                field={field}
                                value={data[field.id]}
                                onChange={(val: any) => handleFieldChange(field.id, val)}
                            />
                        );
                    })}

                    <div className="pt-4 border-t border-neutral-800">
                        <h4 className="text-sm font-medium text-neutral-400 mb-4">Documents</h4>
                        <FileUploader
                            key={currentSection.id}
                            label={`${currentSection.title} Documents`}
                            token={token}
                            section={currentSection.id}
                            initialFiles={data[`${currentSection.id}_files`] || []}
                            onFilesChange={(files) => handleFieldChange(`${currentSection.id}_files`, files)}
                        />
                    </div>
                </div>
            )}

            {currentSection?.gatingQuestion && data[currentSection.gatingQuestion.id] === false && (
                <div className="mb-12 py-10 text-center border border-dashed border-neutral-800 rounded-lg">
                    <p className="text-neutral-500">You selected "No" for this section. You can move to the next step.</p>
                </div>
            )}

            <div className="mt-12 flex justify-between pt-6 border-t border-neutral-800">
                <button
                    onClick={() => setCurrentStepIndex(i => Math.max(0, i - 1))}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white transition-colors"
                >
                    <ChevronLeft size={16} /> Back
                </button>
                <button
                    onClick={() => {
                        if (safeStepIndex < activeSections.length - 1) {
                            setCurrentStepIndex(safeStepIndex + 1)
                        } else {
                            handleSubmit()
                        }
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-500 transition-colors"
                >
                    {safeStepIndex === activeSections.length - 1 ? 'Submit' : 'Continue'} <ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}

function FormField({ field, value, onChange }: { field: FieldDefinition, value: any, onChange: (val: any) => void }) {
    if (field.type === 'dependent-list') {
        const dependents = Array.isArray(value) ? value : [];

        const addDependent = () => {
            onChange([...dependents, { name: '', ssn: '', dob: '', relationship: '' }]);
        };

        const updateDependent = (index: number, key: string, val: string) => {
            const newDeps = [...dependents];
            newDeps[index] = { ...newDeps[index], [key]: val };
            onChange(newDeps);
        };

        const removeDependent = (index: number) => {
            onChange(dependents.filter((_: any, i: number) => i !== index));
        };

        return (
            <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-300">{field.label}</label>
                <div className="space-y-4">
                    {dependents.map((dep, index) => (
                        <div key={index} className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-4 relative group">
                            <button
                                onClick={() => removeDependent(index)}
                                className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove Dependent"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-neutral-500 uppercase font-bold">Full Name</label>
                                    <input
                                        type="text"
                                        value={dep.name || ''}
                                        onChange={(e) => updateDependent(index, 'name', e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-600"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-neutral-500 uppercase font-bold">SSN / ITIN</label>
                                    <input
                                        type="text"
                                        value={dep.ssn || ''}
                                        onChange={(e) => updateDependent(index, 'ssn', e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-600"
                                        placeholder="XXX-XX-XXXX"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-neutral-500 uppercase font-bold">Date of Birth</label>
                                    <input
                                        type="date"
                                        title="Date of Birth"
                                        value={dep.dob || ''}
                                        onChange={(e) => updateDependent(index, 'dob', e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-neutral-500 uppercase font-bold">Relationship</label>
                                    <input
                                        type="text"
                                        title="Relationship"
                                        value={dep.relationship || ''}
                                        onChange={(e) => updateDependent(index, 'relationship', e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-600"
                                        placeholder="e.g. Son, Daughter"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={addDependent}
                        className="w-full py-3 border border-dashed border-neutral-800 rounded-lg text-neutral-500 hover:text-white hover:border-neutral-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <Plus size={16} /> Add Dependent
                    </button>
                    {dependents.length === 0 && (
                        <p className="text-center text-xs text-neutral-600 italic">No dependents added yet.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label htmlFor={field.id} className="block text-sm font-medium text-neutral-300">
                {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
                <textarea
                    id={field.id}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 min-h-[100px]"
                />
            ) : field.type === 'select' ? (
                <select
                    id={field.id}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 appearance-none"
                    title={field.label}
                >
                    <option value="" disabled>Select an option</option>
                    {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={field.type === 'currency' ? 'number' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                    id={field.id}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-600"
                    placeholder={field.type === 'currency' ? '$0.00' : ''}
                />
            )}
        </div>
    )
}
