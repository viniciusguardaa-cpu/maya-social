"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
    Sparkles,
    Plus,
    X,
    Image,
    Video,
    LayoutGrid,
    Trash2
} from "lucide-react"

interface ContentTypeConfig {
    type: string
    frequency: number
    days: number[]
    time: string
    themes: ThemeConfig[]
}

interface ThemeConfig {
    id: string
    name: string
    objective: string
    format: string
}

interface CalendarConfigModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onGenerate: (config: ContentTypeConfig[]) => void
    generating: boolean
}

const CONTENT_TYPES = [
    { value: "FEED", label: "Feed", icon: "📷", color: "bg-pink-500" },
    { value: "REELS", label: "Reels", icon: "🎬", color: "bg-purple-500" },
    { value: "STORIES", label: "Stories", icon: "📱", color: "bg-blue-500" },
    { value: "CAROUSEL", label: "Carrossel", icon: "🎠", color: "bg-orange-500" },
]

const DAYS_OF_WEEK = [
    { value: 0, label: "Dom" },
    { value: 1, label: "Seg" },
    { value: 2, label: "Ter" },
    { value: 3, label: "Qua" },
    { value: 4, label: "Qui" },
    { value: 5, label: "Sex" },
    { value: 6, label: "Sáb" },
]

const OBJECTIVES = [
    "Construção de marca",
    "Tráfego",
    "Engajamento",
    "Vendas",
    "Posicionamento",
    "Autoridade",
    "Relacionamento",
]

const FORMATS = [
    { value: "photo", label: "Foto", icon: Image },
    { value: "video", label: "Vídeo", icon: Video },
    { value: "carousel", label: "Carrossel", icon: LayoutGrid },
]

const DEFAULT_THEMES: Record<string, ThemeConfig[]> = {
    FEED: [
        { id: "1", name: "Posicionamento / Lifestyle", objective: "Construção de marca", format: "photo" },
        { id: "2", name: "Produto / Destaque", objective: "Vendas", format: "photo" },
        { id: "3", name: "Convite / Evento", objective: "Tráfego", format: "video" },
    ],
    REELS: [
        { id: "1", name: "Bastidores", objective: "Relacionamento", format: "video" },
        { id: "2", name: "Tendência / Viral", objective: "Engajamento", format: "video" },
    ],
    STORIES: [
        { id: "1", name: "Bom dia / Engajamento", objective: "Engajamento", format: "photo" },
        { id: "2", name: "Bastidores", objective: "Relacionamento", format: "video" },
        { id: "3", name: "Enquete / Interação", objective: "Engajamento", format: "photo" },
    ],
    CAROUSEL: [
        { id: "1", name: "Educativo / Dicas", objective: "Autoridade", format: "carousel" },
    ],
}

const DEFAULT_CONFIG: ContentTypeConfig[] = [
    { type: "FEED", frequency: 3, days: [1, 3, 5], time: "12:00", themes: DEFAULT_THEMES.FEED },
    { type: "REELS", frequency: 2, days: [2, 4], time: "18:00", themes: DEFAULT_THEMES.REELS },
    { type: "STORIES", frequency: 5, days: [1, 2, 3, 4, 5], time: "09:00", themes: DEFAULT_THEMES.STORIES },
]

export function CalendarConfigModal({ open, onOpenChange, onGenerate, generating }: CalendarConfigModalProps) {
    const [config, setConfig] = useState<ContentTypeConfig[]>(DEFAULT_CONFIG)
    const [expandedType, setExpandedType] = useState<string | null>("FEED")

    const updateTypeConfig = (type: string, updates: Partial<ContentTypeConfig>) => {
        setConfig(prev => prev.map(c =>
            c.type === type ? { ...c, ...updates } : c
        ))
    }

    const addType = (type: string) => {
        if (config.find(c => c.type === type)) return
        setConfig(prev => [...prev, {
            type,
            frequency: 1,
            days: [1],
            time: "12:00",
            themes: DEFAULT_THEMES[type] || []
        }])
        setExpandedType(type)
    }

    const removeType = (type: string) => {
        setConfig(prev => prev.filter(c => c.type !== type))
    }

    const toggleDay = (type: string, day: number) => {
        const typeConfig = config.find(c => c.type === type)
        if (!typeConfig) return

        const newDays = typeConfig.days.includes(day)
            ? typeConfig.days.filter(d => d !== day)
            : [...typeConfig.days, day].sort((a, b) => a - b)

        updateTypeConfig(type, { days: newDays, frequency: newDays.length })
    }

    const addTheme = (type: string) => {
        const typeConfig = config.find(c => c.type === type)
        if (!typeConfig) return

        const newTheme: ThemeConfig = {
            id: Date.now().toString(),
            name: "Novo tema",
            objective: "Engajamento",
            format: "photo"
        }

        updateTypeConfig(type, { themes: [...typeConfig.themes, newTheme] })
    }

    const updateTheme = (type: string, themeId: string, updates: Partial<ThemeConfig>) => {
        const typeConfig = config.find(c => c.type === type)
        if (!typeConfig) return

        const newThemes = typeConfig.themes.map(t =>
            t.id === themeId ? { ...t, ...updates } : t
        )
        updateTypeConfig(type, { themes: newThemes })
    }

    const removeTheme = (type: string, themeId: string) => {
        const typeConfig = config.find(c => c.type === type)
        if (!typeConfig) return

        updateTypeConfig(type, { themes: typeConfig.themes.filter(t => t.id !== themeId) })
    }

    const totalPosts = config.reduce((acc, c) => acc + (c.frequency * 4), 0)

    const unusedTypes = CONTENT_TYPES.filter(t => !config.find(c => c.type === t.value))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Configurar Calendário
                    </DialogTitle>
                    <DialogDescription>
                        Defina a frequência, dias e temas para cada tipo de conteúdo.
                        Estimativa: <strong>{totalPosts} posts/mês</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {config.map((typeConfig) => {
                        const typeInfo = CONTENT_TYPES.find(t => t.value === typeConfig.type)
                        const isExpanded = expandedType === typeConfig.type

                        return (
                            <div key={typeConfig.type} className="border rounded-lg overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer"
                                    onClick={() => setExpandedType(isExpanded ? null : typeConfig.type)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{typeInfo?.icon}</span>
                                        <div>
                                            <p className="font-medium">{typeInfo?.label}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {typeConfig.frequency}x por semana • {typeConfig.themes.length} temas
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">
                                            {typeConfig.frequency * 4}/mês
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeType(typeConfig.type)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-4 space-y-4 border-t">
                                        <div className="space-y-2">
                                            <Label>Dias da semana</Label>
                                            <div className="flex gap-1">
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <Button
                                                        key={day.value}
                                                        variant={typeConfig.days.includes(day.value) ? "default" : "outline"}
                                                        size="sm"
                                                        className="w-10"
                                                        onClick={() => toggleDay(typeConfig.type, day.value)}
                                                    >
                                                        {day.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Horário</Label>
                                                <Input
                                                    type="time"
                                                    value={typeConfig.time}
                                                    onChange={(e) => updateTypeConfig(typeConfig.type, { time: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Temas (rotativos)</Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addTheme(typeConfig.type)}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Adicionar
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {typeConfig.themes.map((theme, index) => (
                                                    <div key={theme.id} className="flex gap-2 items-start p-2 bg-muted/30 rounded-lg">
                                                        <span className="text-sm text-muted-foreground w-6 pt-2">
                                                            {index + 1}.
                                                        </span>
                                                        <div className="flex-1 space-y-2">
                                                            <Input
                                                                placeholder="Nome do tema"
                                                                value={theme.name}
                                                                onChange={(e) => updateTheme(typeConfig.type, theme.id, { name: e.target.value })}
                                                                className="h-8"
                                                            />
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Select
                                                                    value={theme.objective}
                                                                    onValueChange={(v) => updateTheme(typeConfig.type, theme.id, { objective: v })}
                                                                >
                                                                    <SelectTrigger className="h-8 text-xs">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {OBJECTIVES.map((obj) => (
                                                                            <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <Select
                                                                    value={theme.format}
                                                                    onValueChange={(v) => updateTheme(typeConfig.type, theme.id, { format: v })}
                                                                >
                                                                    <SelectTrigger className="h-8 text-xs">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {FORMATS.map((fmt) => (
                                                                            <SelectItem key={fmt.value} value={fmt.value}>
                                                                                {fmt.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeTheme(typeConfig.type, theme.id)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {unusedTypes.length > 0 && (
                        <div className="flex gap-2">
                            {unusedTypes.map((type) => (
                                <Button
                                    key={type.value}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addType(type.value)}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {type.icon} {type.label}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={() => onGenerate(config)} disabled={generating}>
                        {generating ? (
                            <>
                                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Gerar Calendário
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
