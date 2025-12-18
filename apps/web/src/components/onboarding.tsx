"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Calendar,
    FileText,
    BarChart3,
    Sparkles,
    ArrowRight,
    Check,
    Keyboard,
    Building2
} from "lucide-react"

const steps = [
    {
        id: 1,
        title: "Bem-vindo ao Maya! 👋",
        description: "Seu sistema completo de gestão de social media. Vamos fazer um tour rápido?",
        icon: Sparkles,
        tip: null
    },
    {
        id: 2,
        title: "Calendário de Conteúdos",
        description: "Visualize e planeje seus conteúdos em um calendário interativo. Arraste para reagendar e clique para ver detalhes.",
        icon: Calendar,
        tip: "Dica: Use a visão Gantt para ver a timeline completa"
    },
    {
        id: 3,
        title: "Quadro Kanban",
        description: "Acompanhe o status de cada conteúdo do planejamento até a publicação. Arraste cards entre colunas para atualizar.",
        icon: FileText,
        tip: "Dica: Clique em um card para ver detalhes e comentários"
    },
    {
        id: 4,
        title: "Analytics",
        description: "Monitore métricas de engajamento, alcance e performance. Exporte relatórios em CSV ou JSON.",
        icon: BarChart3,
        tip: "Dica: Use os filtros de período para análises específicas"
    },
    {
        id: 5,
        title: "Atalhos de Teclado",
        description: "Navegue rapidamente usando atalhos. Pressione ⌘K para busca global ou ? para ver todos os atalhos.",
        icon: Keyboard,
        tip: "G + D = Dashboard, G + C = Calendário, G + K = Kanban"
    },
    {
        id: 6,
        title: "Multi-Marca",
        description: "Gerencie múltiplas marcas em uma única conta. Troque entre elas pelo seletor na sidebar.",
        icon: Building2,
        tip: "Cada marca tem seus próprios conteúdos, assets e configurações"
    }
]

export function Onboarding() {
    const [open, setOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [completed, setCompleted] = useState(false)

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem("maya-onboarding-complete")
        if (!hasSeenOnboarding) {
            const timer = setTimeout(() => setOpen(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    const handleSkip = () => {
        handleComplete()
    }

    const handleComplete = () => {
        setCompleted(true)
        localStorage.setItem("maya-onboarding-complete", "true")
        setTimeout(() => setOpen(false), 500)
    }

    const step = steps[currentStep]
    const Icon = step.icon
    const isLastStep = currentStep === steps.length - 1

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                {completed ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Tudo pronto!</h3>
                        <p className="text-muted-foreground">
                            Você está preparado para usar o Maya. Bom trabalho!
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <DialogTitle>{step.title}</DialogTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Passo {currentStep + 1} de {steps.length}
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>

                        <DialogDescription className="text-base">
                            {step.description}
                        </DialogDescription>

                        {step.tip && (
                            <Card className="bg-muted/50 border-dashed">
                                <CardContent className="p-3">
                                    <p className="text-sm text-muted-foreground">
                                        💡 {step.tip}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-1.5 py-2">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all ${i === currentStep
                                            ? "w-6 bg-primary"
                                            : i < currentStep
                                                ? "w-1.5 bg-primary/50"
                                                : "w-1.5 bg-muted"
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={handleSkip} className="flex-1">
                                Pular
                            </Button>
                            <Button onClick={handleNext} className="flex-1">
                                {isLastStep ? "Começar" : "Próximo"}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
