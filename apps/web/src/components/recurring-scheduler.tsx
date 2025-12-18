"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
    CalendarClock,
    Repeat,
    Calendar,
    Clock,
    Check,
    Plus,
    Trash2
} from "lucide-react"
import { toast } from "sonner"

interface RecurringSchedule {
    id: string
    name: string
    frequency: "daily" | "weekly" | "biweekly" | "monthly"
    daysOfWeek: number[]
    time: string
    contentType: string
    isActive: boolean
}

const daysOfWeek = [
    { id: 0, name: "Dom", short: "D" },
    { id: 1, name: "Seg", short: "S" },
    { id: 2, name: "Ter", short: "T" },
    { id: 3, name: "Qua", short: "Q" },
    { id: 4, name: "Qui", short: "Q" },
    { id: 5, name: "Sex", short: "S" },
    { id: 6, name: "Sáb", short: "S" },
]

const frequencyOptions = [
    { value: "daily", label: "Diário" },
    { value: "weekly", label: "Semanal" },
    { value: "biweekly", label: "Quinzenal" },
    { value: "monthly", label: "Mensal" },
]

const contentTypes = [
    { value: "FEED", label: "Feed", emoji: "📷" },
    { value: "REELS", label: "Reels", emoji: "🎬" },
    { value: "STORIES", label: "Stories", emoji: "📱" },
    { value: "CAROUSEL", label: "Carrossel", emoji: "🎠" },
]

const mockSchedules: RecurringSchedule[] = [
    { id: "1", name: "Reels Semanal", frequency: "weekly", daysOfWeek: [1, 3, 5], time: "10:00", contentType: "REELS", isActive: true },
    { id: "2", name: "Feed Diário", frequency: "daily", daysOfWeek: [1, 2, 3, 4, 5], time: "12:00", contentType: "FEED", isActive: true },
    { id: "3", name: "Stories Todo Dia", frequency: "daily", daysOfWeek: [0, 1, 2, 3, 4, 5, 6], time: "18:00", contentType: "STORIES", isActive: false },
]

export function RecurringScheduler() {
    const [schedules, setSchedules] = useState<RecurringSchedule[]>(mockSchedules)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newSchedule, setNewSchedule] = useState<{
        name: string
        frequency: "daily" | "weekly" | "biweekly" | "monthly"
        daysOfWeek: number[]
        time: string
        contentType: string
    }>({
        name: "",
        frequency: "weekly",
        daysOfWeek: [],
        time: "10:00",
        contentType: "FEED"
    })

    const toggleDay = (dayId: number) => {
        setNewSchedule(prev => ({
            ...prev,
            daysOfWeek: prev.daysOfWeek.includes(dayId)
                ? prev.daysOfWeek.filter(d => d !== dayId)
                : [...prev.daysOfWeek, dayId]
        }))
    }

    const createSchedule = () => {
        if (!newSchedule.name || newSchedule.daysOfWeek.length === 0) {
            toast.error("Preencha todos os campos")
            return
        }

        const schedule: RecurringSchedule = {
            id: Date.now().toString(),
            ...newSchedule,
            isActive: true
        }

        setSchedules([schedule, ...schedules])
        setNewSchedule({ name: "", frequency: "weekly", daysOfWeek: [], time: "10:00", contentType: "FEED" })
        setIsCreateOpen(false)
        toast.success("Agendamento recorrente criado!")
    }

    const toggleSchedule = (id: string) => {
        setSchedules(schedules.map(s =>
            s.id === id ? { ...s, isActive: !s.isActive } : s
        ))
    }

    const deleteSchedule = (id: string) => {
        setSchedules(schedules.filter(s => s.id !== id))
        toast.success("Agendamento excluído")
    }

    const getFrequencyLabel = (freq: string) => {
        return frequencyOptions.find(f => f.value === freq)?.label || freq
    }

    const getContentEmoji = (type: string) => {
        return contentTypes.find(t => t.value === type)?.emoji || "📄"
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Repeat className="h-4 w-4 text-primary" />
                        Agendamento Recorrente
                    </CardTitle>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Novo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <CalendarClock className="h-5 w-5" />
                                    Criar Agendamento Recorrente
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome</Label>
                                    <Input
                                        placeholder="Ex: Reels Semanal"
                                        value={newSchedule.name}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tipo de Conteúdo</Label>
                                        <Select
                                            value={newSchedule.contentType}
                                            onValueChange={(v) => setNewSchedule({ ...newSchedule, contentType: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {contentTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.emoji} {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Frequência</Label>
                                        <Select
                                            value={newSchedule.frequency}
                                            onValueChange={(v: "daily" | "weekly" | "biweekly" | "monthly") =>
                                                setNewSchedule({ ...newSchedule, frequency: v })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {frequencyOptions.map((freq) => (
                                                    <SelectItem key={freq.value} value={freq.value}>
                                                        {freq.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Dias da Semana</Label>
                                    <div className="flex gap-1">
                                        {daysOfWeek.map((day) => (
                                            <button
                                                key={day.id}
                                                onClick={() => toggleDay(day.id)}
                                                className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${newSchedule.daysOfWeek.includes(day.id)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted hover:bg-muted/80"
                                                    }`}
                                            >
                                                {day.short}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Horário</Label>
                                    <Input
                                        type="time"
                                        value={newSchedule.time}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                                    />
                                </div>

                                <Button onClick={createSchedule} className="w-full">
                                    <Check className="h-4 w-4 mr-2" />
                                    Criar Agendamento
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {schedules.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Repeat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum agendamento recorrente</p>
                    </div>
                ) : (
                    schedules.map((schedule) => (
                        <div
                            key={schedule.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-opacity ${schedule.isActive ? "" : "opacity-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{getContentEmoji(schedule.contentType)}</span>
                                <div>
                                    <p className="font-medium text-sm">{schedule.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="secondary" className="text-xs">
                                            {getFrequencyLabel(schedule.frequency)}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {schedule.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => toggleSchedule(schedule.id)}
                                >
                                    <div className={`w-8 h-4 rounded-full transition-colors ${schedule.isActive ? "bg-primary" : "bg-muted"
                                        }`}>
                                        <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${schedule.isActive ? "translate-x-4" : "translate-x-0.5"
                                            }`} />
                                    </div>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => deleteSchedule(schedule.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
