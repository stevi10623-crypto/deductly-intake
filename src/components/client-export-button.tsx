'use client'

import { Download } from "lucide-react"

export function ClientExportButton({ clients }: { clients: any[] }) {
    const handleDownload = () => {
        try {
            console.log("Starting export with clients:", clients)

            if (!clients || !Array.isArray(clients) || clients.length === 0) {
                alert("No clients to export (List is empty or invalid).")
                console.warn("Export aborted: clients list is empty or invalid", clients)
                return
            }

            // Define headers
            const headers = ["Client Name", "Email", "Tax Year", "Status", "Intake Token", "Last Updated"]

            // Map data to CSV rows
            const rows = clients.map(client => {
                try {
                    const intake = client.intakes?.[0]
                    const nameRaw = client.name || "Unknown Client"
                    const name = `"${nameRaw.replace(/"/g, '""')}"` // Handle quotes in name
                    const email = client.email || ""
                    const taxYear = intake?.tax_year || "N/A"
                    const status = intake?.status || "no_intake"
                    const token = intake?.token || ""
                    const dateRaw = intake?.updated_at || client.created_at
                    const updated = dateRaw ? new Date(dateRaw).toLocaleDateString() : "N/A"

                    return [name, email, taxYear, status, token, updated].join(",")
                } catch (rowError) {
                    console.error("Error processing row for client:", client, rowError)
                    return [`"Error loading client"`, "", "", "error", "", ""].join(",")
                }
            })

            // Combine headers and rows
            const csvContent = [headers.join(","), ...rows].join("\n")

            // Create blob and download link
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `clients_export_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = "hidden"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            console.log("Export successful")
        } catch (error) {
            console.error("Export failed:", error)
            alert("Failed to export CSV. Check console for details.")
        }
    }

    return (
        <button
            onClick={handleDownload}
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors border border-neutral-700"
        >
            <Download size={16} />
            Export CSV
        </button>
    )
}
