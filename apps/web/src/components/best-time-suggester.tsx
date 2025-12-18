"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Clock,
    Sparkles,
    TrendingUp,
    Calendar,
    Check
} from "lucide-react"
import { toast } from "sonner"

interface TimeSlot {
    day: string
    time: string
    score: number
    engagement: string
    recommended: boolean
}

const mockTimeSlots: TimeSlot[] = [
    { day: "Segunda", time: "10:00", score: 95, engagement: "Alto", recommended: true },
    { day: "Segunda", time: "18:00", score: 88, engagement: "Alto", recommended: true },
    { day: "Terça", time: "12:00", score: 92, engagement: "Alto", recommended: true },
    { day: "Quarta", time: "19:00", score: 85, engagement: "Médio", recommended: false },
    { day: "Quinta", time: "10:00", score: 90, engagement: "Alto", recommended: true },
    { day: "Sexta", time: "17:00", score: 87, engagement: "Médio", recommended: false },
    { day: "Sábado", time: "11:00", score: 82, engagement: "Médio", recommended: false },
    { day: "Domingo", time: "20:00", score: 78, engagement: "Médio", recommended: false },
]

interface BestTimeSuggesterProps {
    contentType?: string
    onSelectTime?: (day: string, time: string) => void
}

export function BestTimeSuggester({ contentType = "REELS", onSelectTime }: BestTimeSuggesterProps) {
    const [slots] = useState<TimeSlot[]>(mockTimeSlots)
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

    const handleSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot)
        onSelectTime?.(slot.day, slot.time)
        toast.success(`${slot.day} às ${slot.time} selecionado!`)
    }

    const topSlots = slots.filter(s => s.recommended).slice(0, 4)

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Melhores Horários para {contentType}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                    Baseado no histórico de engajamento da sua audiência
                </p>

                <div className="grid grid-cols-2 gap-2">
                    {topSlots.map((slot, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(slot)}
                            className={`p-3 rounded-lg border text-left transition-all ${selectedSlot === slot
                                    ? "border-primary bg-primary/5"
                                    : "hover:border-primary/50 hover:bg-muted/50"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm font-medium">{slot.day}</span>
                                </div>
                                {selectedSlot === slot && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-lg font-bold">{slot.time}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <Badge
                                    variant={slot.engagement === "Alto" ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    {slot.engagement}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    Score: {slot.score}%
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <Button variant="outline" size="sm" className="w-full">
                    Ver todos os horários
                </Button>
            </CardContent>
        </Card>
    )
}
