'use client'

import * as XLSX from 'xlsx'
import { Download, FileSpreadsheet, FileJson } from "lucide-react"
import { INTAKE_SECTIONS } from "@/lib/rules-engine"

interface SingleClientExportButtonProps {
    client: any
    intakeData: any
}

export function SingleClientExportButton({ client, intakeData }: SingleClientExportButtonProps) {
    const getDataRows = () => {
        const rows: any[] = []

        // Client Info Section
        rows.push(["Client Information", ""])
        rows.push(["Name", client.name || ""])
        rows.push(["Email", client.email || ""])
        rows.push(["Status", client.intakes?.[0]?.status || ""])
        rows.push(["Tax Year", client.intakes?.[0]?.tax_year?.toString() || ""])
        rows.push(["Last Updated", client.intakes?.[0]?.updated_at ? new Date(client.intakes[0].updated_at).toLocaleString() : ""])
        rows.push(["", ""]) // Spacer

        // Intake Responses
        INTAKE_SECTIONS.forEach(section => {
            if (section.category === 'business' && intakeData.taxType !== 'Personal + Business (Self-Employed/Freelance)') {
                return
            }

            rows.push([section.title.toUpperCase(), ""]) // Section Header

            const gatingValue = section.gatingQuestion ? intakeData[section.gatingQuestion.id] : true
            if (gatingValue === false || gatingValue === 'false') {
                rows.push(["Status", "Skipped (User selected No)"])
            } else {
                section.fields.forEach(field => {
                    let value = intakeData[field.id]

                    if (value === undefined || value === null) {
                        value = ""
                    } else if (field.type === 'currency') {
                        // Format as currency $1,234.56
                        const num = parseFloat(value)
                        value = isNaN(num) ? value : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
                    } else if (typeof value === 'boolean') {
                        value = value ? "Yes" : "No"
                    }

                    rows.push([field.label, value])
                })
            }
            rows.push(["", ""]) // Spacer
        })
        return rows
    }

    const handleCsvDownload = () => {
        try {
            const rows = getDataRows()
            // Simple CSV escape
            const csvContent = rows.map(r => r.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `${client.name?.replace(/\s+/g, '_')}_intake.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error("CSV Export failed:", error)
            alert("Failed to export input data.")
        }
    }

    const handleExcelDownload = () => {
        try {
            const rows = getDataRows()

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.aoa_to_sheet(rows)

            // Set column widths
            ws['!cols'] = [{ wch: 50 }, { wch: 80 }]

            // Append sheet
            XLSX.utils.book_append_sheet(wb, ws, "Intake Data")

            // Write and download
            XLSX.writeFile(wb, `${client.name?.replace(/\s+/g, '_')}_intake.xlsx`)
        } catch (error) {
            console.error("Excel Export failed:", error)
            alert("Failed to export Excel file. Ensure 'xlsx' package is installed.")
        }
    }

    const handleJsonDownload = () => {
        try {
            const exportData = {
                client: {
                    name: client.name,
                    email: client.email,
                    id: client.id,
                    status: client.status,
                    updated_at: client.updated_at
                },
                intake: {
                    status: client.intakes?.[0]?.status,
                    tax_year: client.intakes?.[0]?.tax_year,
                    token: client.intakes?.[0]?.token,
                    data: intakeData
                },
                meta: {
                    export_date: new Date().toISOString(),
                    version: "1.0"
                }
            }

            const jsonContent = JSON.stringify(exportData, null, 2)
            const blob = new Blob([jsonContent], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `${client.name?.replace(/\s+/g, '_')}_intake.json`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error("JSON Export failed:", error)
            alert("Failed to export JSON file.")
        }
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            <button
                onClick={handleExcelDownload}
                className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors group w-full text-left"
            >
                <FileSpreadsheet className="text-green-500 group-hover:text-green-400" size={20} />
                <span className="text-sm font-medium">Download Excel (.xlsx)</span>
            </button>
            <button
                onClick={handleCsvDownload}
                className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors group w-full text-left"
            >
                <Download className="text-neutral-500 group-hover:text-blue-500" size={20} />
                <span className="text-sm font-medium">Download CSV (.csv)</span>
            </button>
            <button
                onClick={handleJsonDownload}
                className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors group w-full text-left"
            >
                <FileJson className="text-yellow-500 group-hover:text-yellow-400" size={20} />
                <span className="text-sm font-medium">Download JSON (.json)</span>
            </button>
        </div>
    )
}
