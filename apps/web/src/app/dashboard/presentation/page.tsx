"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    Maximize,
    X,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Calendar,
    Clock,
    Share2
} from "lucide-react"
import { toast } from "sonner"

interface ContentSlide {
    id: string
    code: string
    title: string
    type: string
    description: string
    objective: string
    cta: string
    hashtags: string[]
    scheduledAt?: string
    status: "pending" | "approved" | "rejected"
}

const mockSlides: ContentSlide[] = [
    {
        id: "1",
        code: "MAYA_RL_12",
        title: "Reels: 5 Dicas de Marketing Digital",
        type: "REELS",
        description: "Vídeo vertical com 5 dicas práticas de marketing digital para pequenas empresas. Transições dinâmicas e texto na tela.",
        objective: "Educar e gerar autoridade",
        cta: "Salva pra não esquecer! 🔖",
        hashtags: ["marketing", "dicas", "digital", "negocios", "empreendedorismo"],
        scheduledAt: "2025-01-20T10:00:00",
        status: "pending"
    },
    {
        id: "2",
        code: "MAYA_FD_08",
        title: "Post: Novidades do Mês de Janeiro",
        type: "FEED",
        description: "Post estático destacando as principais novidades e lançamentos do mês. Design clean com cores da marca.",
        objective: "Informar e engajar",
        cta: "Qual novidade você mais gostou? Comenta! 👇",
        hashtags: ["novidades", "janeiro", "lancamento", "maya"],
        scheduledAt: "2025-01-21T12:00:00",
        status: "pending"
    },
    {
        id: "3",
        code: "MAYA_CA_05",
        title: "Carrossel: Tendências 2025",
        type: "CAROUSEL",
        description: "Carrossel com 8 slides apresentando as principais tendências de marketing digital para 2025.",
        objective: "Educar e posicionar como referência",
        cta: "Compartilha com quem precisa ver isso! 📲",
        hashtags: ["tendencias", "2025", "marketing", "futuro"],
        scheduledAt: "2025-01-22T18:00:00",
        status: "pending"
    },
    {
        id: "4",
        code: "MAYA_ST_03",
        title: "Stories: Bastidores da Produção",
        type: "STORIES",
        description: "Sequência de stories mostrando o processo criativo e bastidores da equipe.",
        objective: "Humanizar a marca",
        cta: "Quer ver mais bastidores? Reage! ❤️",
        hashtags: [],
        status: "pending"
    },
]

const typeIcons: Record<string, string> = {
    FEED: "📷",
    REELS: "🎬",
    STORIES: "📱",
    CAROUSEL: "🎠",
}

export default function PresentationPage() {
    const [slides, setSlides] = useState<ContentSlide[]>(mockSlides)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const currentSlide = slides[currentIndex]
    const progress = ((currentIndex + 1) / slides.length) * 100

    const goNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const approve = () => {
        setSlides(slides.map((s, i) =>
            i === currentIndex ? { ...s, status: "approved" } : s
        ))
        toast.success("Conteúdo aprovado!")
        if (currentIndex < slides.length - 1) {
            setTimeout(goNext, 500)
        }
    }

    const reject = () => {
        setSlides(slides.map((s, i) =>
            i === currentIndex ? { ...s, status: "rejected" } : s
        ))
        toast.error("Conteúdo rejeitado")
        if (currentIndex < slides.length - 1) {
            setTimeout(goNext, 500)
        }
    }

    const approvedCount = slides.filter(s => s.status === "approved").length
    const rejectedCount = slides.filter(s => s.status === "rejected").length

    return (
        <div className={`min-h-screen ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">Modo Apresentação</h1>
                    <Badge variant="secondary">
                        {currentIndex + 1} / {slides.length}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {approvedCount}
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        {rejectedCount}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                        {isFullscreen ? <X className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-1 rounded-none" />

            {/* Main Content */}
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Navigation Dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {slides.map((slide, i) => (
                            <button
                                key={slide.id}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-3 h-3 rounded-full transition-all ${i === currentIndex
                                        ? "bg-primary scale-125"
                                        : slide.status === "approved"
                                            ? "bg-green-500"
                                            : slide.status === "rejected"
                                                ? "bg-red-500"
                                                : "bg-muted"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Slide Card */}
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{typeIcons[currentSlide.type] || "📄"}</span>
                                    <div>
                                        <Badge>{currentSlide.type}</Badge>
                                        <p className="text-sm text-muted-foreground font-mono mt-1">
                                            {currentSlide.code}
                                        </p>
                                    </div>
                                </div>
                                {currentSlide.status !== "pending" && (
                                    <Badge
                                        variant={currentSlide.status === "approved" ? "default" : "destructive"}
                                        className="text-sm"
                                    >
                                        {currentSlide.status === "approved" ? "✓ Aprovado" : "✗ Rejeitado"}
                                    </Badge>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold">{currentSlide.title}</h2>
                        </div>

                        <CardContent className="p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
                                <p className="text-lg">{currentSlide.description}</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Objetivo</h3>
                                    <p>{currentSlide.objective}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Call to Action</h3>
                                    <p className="font-medium">{currentSlide.cta}</p>
                                </div>
                            </div>

                            {currentSlide.hashtags.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Hashtags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentSlide.hashtags.map((tag, i) => (
                                            <Badge key={i} variant="secondary">#{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentSlide.scheduledAt && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Agendado para: </span>
                                    <span className="font-medium text-foreground">
                                        {new Date(currentSlide.scheduledAt).toLocaleDateString("pt-BR", {
                                            weekday: "long",
                                            day: "2-digit",
                                            month: "long",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-8">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft className="h-5 w-5 mr-2" />
                            Anterior
                        </Button>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                className="text-destructive hover:text-destructive border-destructive/50"
                                onClick={reject}
                                disabled={currentSlide.status !== "pending"}
                            >
                                <ThumbsDown className="h-5 w-5 mr-2" />
                                Rejeitar
                            </Button>
                            <Button
                                size="lg"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={approve}
                                disabled={currentSlide.status !== "pending"}
                            >
                                <ThumbsUp className="h-5 w-5 mr-2" />
                                Aprovar
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={goNext}
                            disabled={currentIndex === slides.length - 1}
                        >
                            Próximo
                            <ChevronRight className="h-5 w-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
