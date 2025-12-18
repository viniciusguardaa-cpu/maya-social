"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Lightbulb,
    Sparkles,
    RefreshCw,
    Plus,
    TrendingUp,
    Calendar,
    Check
} from "lucide-react"
import { toast } from "sonner"

interface ContentIdea {
    id: string
    title: string
    type: string
    category: string
    trendScore: number
    description: string
}

const mockIdeas: ContentIdea[] = [
    { id: "1", title: "5 Erros que estão matando seu alcance", type: "REELS", category: "Educativo", trendScore: 95, description: "Vídeo mostrando erros comuns e como corrigir" },
    { id: "2", title: "Antes x Depois: Transformação de perfil", type: "CAROUSEL", category: "Case", trendScore: 88, description: "Carrossel com resultados de cliente" },
    { id: "3", title: "Um dia na vida de social media manager", type: "REELS", category: "Bastidores", trendScore: 82, description: "Vlog do dia a dia de trabalho" },
    { id: "4", title: "Checklist: Post perfeito para Instagram", type: "CAROUSEL", category: "Educativo", trendScore: 90, description: "Lista com todos os elementos de um bom post" },
    { id: "5", title: "Mito ou Verdade sobre algoritmo", type: "REELS", category: "Educativo", trendScore: 85, description: "Desmentindo mitos sobre o algoritmo" },
    { id: "6", title: "Ferramentas que uso no dia a dia", type: "FEED", category: "Recomendação", trendScore: 78, description: "Post com stack de ferramentas" },
]

const typeIcons: Record<string, string> = {
    FEED: "📷",
    REELS: "🎬",
    STORIES: "📱",
    CAROUSEL: "🎠",
}

interface ContentIdeasGeneratorProps {
    onAddIdea?: (idea: ContentIdea) => void
}

export function ContentIdeasGenerator({ onAddIdea }: ContentIdeasGeneratorProps) {
    const [ideas, setIdeas] = useState<ContentIdea[]>(mockIdeas)
    const [isGenerating, setIsGenerating] = useState(false)
    const [topic, setTopic] = useState("")
    const [addedIds, setAddedIds] = useState<string[]>([])

    const generateIdeas = async () => {
        setIsGenerating(true)
        await new Promise(r => setTimeout(r, 1500))

        const newIdeas: ContentIdea[] = [
            { id: Date.now().toString(), title: `${topic || "Tendência"}: O que você precisa saber`, type: "REELS", category: "Trend", trendScore: 92, description: "Conteúdo baseado em trend atual" },
            { id: (Date.now() + 1).toString(), title: `3 Segredos sobre ${topic || "Marketing"}`, type: "CAROUSEL", category: "Educativo", trendScore: 87, description: "Carrossel com dicas exclusivas" },
        ]

        setIdeas([...newIdeas, ...ideas])
        setIsGenerating(false)
        toast.success("Novas ideias geradas!")
    }

    const addToCalendar = (idea: ContentIdea) => {
        setAddedIds([...addedIds, idea.id])
        onAddIdea?.(idea)
        toast.success(`"${idea.title}" adicionado ao calendário!`)
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Gerador de Ideias com IA
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Tema ou nicho (opcional)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={generateIdeas} disabled={isGenerating}>
                        {isGenerating ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {ideas.map((idea) => (
                        <div
                            key={idea.id}
                            className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors"
                        >
                            <span className="text-2xl">{typeIcons[idea.type] || "📄"}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm truncate">{idea.title}</p>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{idea.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">{idea.type}</Badge>
                                    <Badge variant="outline" className="text-xs">{idea.category}</Badge>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <TrendingUp className="h-3 w-3" />
                                        {idea.trendScore}%
                                    </div>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant={addedIds.includes(idea.id) ? "secondary" : "outline"}
                                onClick={() => addToCalendar(idea)}
                                disabled={addedIds.includes(idea.id)}
                            >
                                {addedIds.includes(idea.id) ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
