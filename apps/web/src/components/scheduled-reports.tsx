"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    FileText,
    Mail,
    Calendar,
    Plus,
    Trash2,
    Clock,
    Send,
    Check
} from "lucide-react"
import { toast } from "sonner"

interface ScheduledReport {
    id: string
    name: string
    frequency: "daily" | "weekly" | "monthly"
    recipients: string[]
    metrics: string[]
    nextSend: string
    isActive: boolean
}

const metricOptions = [
    { id: "engagement", label: "Engajamento", desc: "Likes, comentários, shares" },
    { id: "reach", label: "Alcance", desc: "Impressões e alcance único" },
    { id: "followers", label: "Seguidores", desc: "Crescimento de seguidores" },
    { id: "content", label: "Conteúdos", desc: "Posts publicados e performance" },
    { id: "bestTimes", label: "Melhores Horários", desc: "Horários de pico" },
    { id: "hashtags", label: "Hashtags", desc: "Performance de hashtags" },
]

const mockReports: ScheduledReport[] = [
    {
        id: "1",
        name: "Relatório Semanal",
        frequency: "weekly",
        recipients: ["cliente@empresa.com", "marketing@empresa.com"],
        metrics: ["engagement", "reach", "content"],
        nextSend: "Segunda, 09:00",
        isActive: true
    },
    {
        id: "2",
        name: "Performance Mensal",
        frequency: "monthly",
        recipients: ["diretoria@empresa.com"],
        metrics: ["engagement", "reach", "followers", "content", "bestTimes"],
        nextSend: "01/02, 09:00",
        isActive: true
    },
]

export function ScheduledReports() {
    const [reports, setReports] = useState<ScheduledReport[]>(mockReports)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newReport, setNewReport] = useState({
        name: "",
        frequency: "weekly" as "daily" | "weekly" | "monthly",
        recipients: "",
        metrics: [] as string[]
    })

    const toggleMetric = (metricId: string) => {
        setNewReport(prev => ({
            ...prev,
            metrics: prev.metrics.includes(metricId)
                ? prev.metrics.filter(m => m !== metricId)
                : [...prev.metrics, metricId]
        }))
    }

    const createReport = () => {
        if (!newReport.name || !newReport.recipients || newReport.metrics.length === 0) {
            toast.error("Preencha todos os campos")
            return
        }

        const report: ScheduledReport = {
            id: Date.now().toString(),
            name: newReport.name,
            frequency: newReport.frequency,
            recipients: newReport.recipients.split(",").map(e => e.trim()),
            metrics: newReport.metrics,
            nextSend: newReport.frequency === "daily" ? "Amanhã, 09:00"
                : newReport.frequency === "weekly" ? "Segunda, 09:00"
                    : "01/02, 09:00",
            isActive: true
        }

        setReports([report, ...reports])
        setNewReport({ name: "", frequency: "weekly", recipients: "", metrics: [] })
        setIsCreateOpen(false)
        toast.success("Relatório agendado com sucesso!")
    }

    const toggleReport = (id: string) => {
        setReports(reports.map(r =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
        ))
    }

    const deleteReport = (id: string) => {
        setReports(reports.filter(r => r.id !== id))
        toast.success("Relatório excluído")
    }

    const sendNow = (report: ScheduledReport) => {
        toast.success(`Relatório "${report.name}" enviado para ${report.recipients.length} destinatário(s)!`)
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="h-4 w-4 text-primary" />
                        Relatórios Agendados
                    </CardTitle>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Novo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Criar Relatório Agendado
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome do Relatório</Label>
                                    <Input
                                        placeholder="Ex: Relatório Semanal"
                                        value={newReport.name}
                                        onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Frequência</Label>
                                    <Select
                                        value={newReport.frequency}
                                        onValueChange={(v: "daily" | "weekly" | "monthly") =>
                                            setNewReport({ ...newReport, frequency: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Diário</SelectItem>
                                            <SelectItem value="weekly">Semanal</SelectItem>
                                            <SelectItem value="monthly">Mensal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Destinatários (separados por vírgula)</Label>
                                    <Input
                                        placeholder="email1@empresa.com, email2@empresa.com"
                                        value={newReport.recipients}
                                        onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Métricas Incluídas</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {metricOptions.map((metric) => (
                                            <div
                                                key={metric.id}
                                                onClick={() => toggleMetric(metric.id)}
                                                className={`p-2 rounded-lg border cursor-pointer transition-colors ${newReport.metrics.includes(metric.id)
                                                        ? "border-primary bg-primary/5"
                                                        : "hover:bg-muted"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Checkbox checked={newReport.metrics.includes(metric.id)} />
                                                    <span className="text-sm font-medium">{metric.label}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 ml-6">
                                                    {metric.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button onClick={createReport} className="w-full">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Agendar Relatório
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {reports.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum relatório agendado</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div
                            key={report.id}
                            className={`p-3 rounded-lg border transition-opacity ${report.isActive ? "" : "opacity-50"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm">{report.name}</p>
                                        <Badge variant="secondary" className="text-xs">
                                            {report.frequency === "daily" ? "Diário"
                                                : report.frequency === "weekly" ? "Semanal"
                                                    : "Mensal"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Mail className="h-3 w-3" />
                                        <span>{report.recipients.length} destinatário(s)</span>
                                        <span>•</span>
                                        <Clock className="h-3 w-3" />
                                        <span>Próximo: {report.nextSend}</span>
                                    </div>
                                    <div className="flex gap-1 mt-2">
                                        {report.metrics.slice(0, 3).map((m) => (
                                            <Badge key={m} variant="outline" className="text-xs">
                                                {metricOptions.find(o => o.id === m)?.label}
                                            </Badge>
                                        ))}
                                        {report.metrics.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{report.metrics.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => sendNow(report)}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => toggleReport(report.id)}
                                    >
                                        <div className={`w-8 h-4 rounded-full transition-colors ${report.isActive ? "bg-primary" : "bg-muted"
                                            }`}>
                                            <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${report.isActive ? "translate-x-4" : "translate-x-0.5"
                                                }`} />
                                        </div>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive"
                                        onClick={() => deleteReport(report.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
