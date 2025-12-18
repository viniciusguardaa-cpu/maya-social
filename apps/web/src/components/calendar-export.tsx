"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Download,
    FileSpreadsheet,
    FileText,
    Calendar,
    Image,
    Share2
} from "lucide-react"
import { toast } from "sonner"

interface ContentItem {
    id: string
    code: string
    title: string
    type: string
    status: string
    scheduledAt?: string
    description?: string
}

interface CalendarExportProps {
    contents: ContentItem[]
    month?: string
}

export function CalendarExport({ contents, month = "Janeiro 2025" }: CalendarExportProps) {
    const [isExporting, setIsExporting] = useState(false)

    const exportToCSV = () => {
        setIsExporting(true)

        const headers = ["Código", "Título", "Tipo", "Status", "Data Agendada", "Descrição"]
        const rows = contents.map(c => [
            c.code,
            c.title || "",
            c.type,
            c.status,
            c.scheduledAt ? new Date(c.scheduledAt).toLocaleString("pt-BR") : "",
            c.description || ""
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `calendario_${month.replace(" ", "_")}.csv`
        link.click()
        URL.revokeObjectURL(url)

        setIsExporting(false)
        toast.success("Calendário exportado como CSV!")
    }

    const exportToJSON = () => {
        setIsExporting(true)

        const data = {
            month,
            exportedAt: new Date().toISOString(),
            totalContents: contents.length,
            contents: contents.map(c => ({
                code: c.code,
                title: c.title,
                type: c.type,
                status: c.status,
                scheduledAt: c.scheduledAt,
                description: c.description
            }))
        }

        const jsonStr = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonStr], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `calendario_${month.replace(" ", "_")}.json`
        link.click()
        URL.revokeObjectURL(url)

        setIsExporting(false)
        toast.success("Calendário exportado como JSON!")
    }

    const exportToICS = () => {
        setIsExporting(true)

        const events = contents
            .filter(c => c.scheduledAt)
            .map(c => {
                const date = new Date(c.scheduledAt!)
                const dateStr = date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
                return `BEGIN:VEVENT
DTSTART:${dateStr}
DTEND:${dateStr}
SUMMARY:${c.title || c.code}
DESCRIPTION:${c.description || c.type}
END:VEVENT`
            })

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Maya//Calendar//PT
${events.join("\n")}
END:VCALENDAR`

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `calendario_${month.replace(" ", "_")}.ics`
        link.click()
        URL.revokeObjectURL(url)

        setIsExporting(false)
        toast.success("Calendário exportado como ICS!")
    }

    const copyLink = () => {
        const shareData = {
            month,
            contents: contents.length,
            url: window.location.href
        }
        navigator.clipboard.writeText(JSON.stringify(shareData))
        toast.success("Link do calendário copiado!")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToCSV}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    CSV (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToJSON}>
                    <FileText className="h-4 w-4 mr-2" />
                    JSON (Dados)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToICS}>
                    <Calendar className="h-4 w-4 mr-2" />
                    ICS (Calendário)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyLink}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Copiar Link
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
