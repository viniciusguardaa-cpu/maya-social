"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Plus,
    Pencil,
    Trash2,
    Calendar,
    Clock,
    Sparkles,
    RefreshCw,
    Loader2,
    CheckCircle,
    XCircle
} from "lucide-react"

interface Template {
    id: string
    name: string
    type: string
    dayOfWeek: number
    time: string
    category?: string
    isActive: boolean
}

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const typeOptions = ["FEED", "REELS", "STORIES", "CAROUSEL"]
const categoryOptions = ["PRODUTO", "TREND", "EDUCATIVO", "ENGAJAMENTO", "BASTIDORES", "LIFESTYLE", "PROMO"]

const typeColors: Record<string, string> = {
    FEED: "bg-pink-500",
    REELS: "bg-purple-500",
    STORIES: "bg-blue-500",
    CAROUSEL: "bg-orange-500",
}

const typeIcons: Record<string, string> = {
    FEED: "📷",
    REELS: "🎬",
    STORIES: "📱",
    CAROUSEL: "🎠",
}

export default function TemplatesPage() {
    const { currentOrg, currentBrand } = useAuthStore()
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        type: "FEED",
        dayOfWeek: 1,
        time: "10:00",
        category: "PRODUTO",
    })

    const fetchTemplates = async () => {
        if (!currentOrg || !currentBrand) return

        setLoading(true)
        try {
            const response = await api.get(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/templates`
            )
            setTemplates(response.data)
        } catch (error) {
            console.error("Failed to fetch templates:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [currentOrg, currentBrand])

    const openCreateDialog = () => {
        setEditingTemplate(null)
        setFormData({
            name: "",
            type: "FEED",
            dayOfWeek: 1,
            time: "10:00",
            category: "PRODUTO",
        })
        setDialogOpen(true)
    }

    const openEditDialog = (template: Template) => {
        setEditingTemplate(template)
        setFormData({
            name: template.name,
            type: template.type,
            dayOfWeek: template.dayOfWeek,
            time: template.time,
            category: template.category || "PRODUTO",
        })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!currentOrg || !currentBrand) return

        setSaving(true)
        try {
            if (editingTemplate) {
                await api.patch(
                    `/organizations/${currentOrg.id}/brands/${currentBrand.id}/templates/${editingTemplate.id}`,
                    formData
                )
            } else {
                await api.post(
                    `/organizations/${currentOrg.id}/brands/${currentBrand.id}/templates`,
                    formData
                )
            }
            setDialogOpen(false)
            fetchTemplates()
        } catch (error) {
            console.error("Failed to save template:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!currentOrg || !currentBrand) return
        if (!confirm("Tem certeza que deseja excluir este template?")) return

        try {
            await api.delete(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/templates/${id}`
            )
            fetchTemplates()
        } catch (error) {
            console.error("Failed to delete template:", error)
        }
    }

    const handleToggleActive = async (template: Template) => {
        if (!currentOrg || !currentBrand) return

        try {
            await api.patch(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/templates/${template.id}`,
                { isActive: !template.isActive }
            )
            fetchTemplates()
        } catch (error) {
            console.error("Failed to toggle template:", error)
        }
    }

    const createDefaults = async () => {
        if (!currentOrg || !currentBrand) return

        setSaving(true)
        try {
            await api.post(
                `/organizations/${currentOrg.id}/brands/${currentBrand.id}/templates/defaults`
            )
            fetchTemplates()
        } catch (error) {
            console.error("Failed to create defaults:", error)
        } finally {
            setSaving(false)
        }
    }

    const groupedByDay = templates.reduce((acc, template) => {
        const day = template.dayOfWeek
        if (!acc[day]) acc[day] = []
        acc[day].push(template)
        return acc
    }, {} as Record<number, Template[]>)

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Templates de Conteúdo</h1>
                    <p className="text-muted-foreground">
                        Configure os tipos de conteúdo para geração automática do calendário
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchTemplates}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                    </Button>
                    {templates.length === 0 && (
                        <Button variant="outline" size="sm" onClick={createDefaults} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            Criar Padrões
                        </Button>
                    )}
                    <Button size="sm" onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Template
                    </Button>
                </div>
            </div>

            {/* Templates Grid by Day */}
            {templates.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">Nenhum template configurado</p>
                        <p className="text-sm text-muted-foreground mb-4">
                            Crie templates para definir quando cada tipo de conteúdo será publicado
                        </p>
                        <Button onClick={createDefaults} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            Criar Templates Padrão
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                        const dayTemplates = groupedByDay[day] || []
                        if (dayTemplates.length === 0) return null

                        return (
                            <Card key={day}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {dayNames[day]}
                                        <Badge variant="secondary" className="ml-auto">
                                            {dayTemplates.length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {dayTemplates.sort((a, b) => a.time.localeCompare(b.time)).map((template) => (
                                        <div
                                            key={template.id}
                                            className={`flex items-center gap-2 p-2 rounded-lg border ${template.isActive ? "bg-card" : "bg-muted/50 opacity-60"
                                                }`}
                                        >
                                            <span className="text-lg">{typeIcons[template.type]}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{template.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {template.time}
                                                    {template.category && (
                                                        <Badge variant="outline" className="text-[10px] px-1">
                                                            {template.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => handleToggleActive(template)}
                                                >
                                                    {template.isActive ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => openEditDialog(template)}
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive"
                                                    onClick={() => handleDelete(template.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-muted-foreground">Tipos:</span>
                {Object.entries(typeIcons).map(([type, icon]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <span>{icon}</span>
                        <span className="text-sm">{type}</span>
                    </div>
                ))}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? "Editar Template" : "Novo Template"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Feed Segunda"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeOptions.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {typeIcons[type]} {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Dia da Semana</Label>
                                <Select
                                    value={formData.dayOfWeek.toString()}
                                    onValueChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dayNames.map((day, i) => (
                                            <SelectItem key={i} value={i.toString()}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Horário</Label>
                                <Input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving || !formData.name}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingTemplate ? "Salvar" : "Criar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
