"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sparkles,
    Copy,
    RefreshCw,
    Check,
    Wand2,
    MessageSquare,
    Hash,
    Target
} from "lucide-react"
import { toast } from "sonner"

interface CaptionGeneratorProps {
    contentType: string
    briefTitle?: string
    briefDescription?: string
    onCaptionGenerated?: (caption: string, hashtags: string[]) => void
}

const toneOptions = [
    { value: "profissional", label: "Profissional", emoji: "💼" },
    { value: "casual", label: "Casual", emoji: "😊" },
    { value: "engracado", label: "Engraçado", emoji: "😂" },
    { value: "inspirador", label: "Inspirador", emoji: "✨" },
    { value: "educativo", label: "Educativo", emoji: "📚" },
    { value: "urgente", label: "Urgente/FOMO", emoji: "🔥" },
]

const ctaOptions = [
    { value: "curtir", label: "Curtir", text: "Curtiu? Deixa o like! ❤️" },
    { value: "comentar", label: "Comentar", text: "Comenta aqui o que você achou! 👇" },
    { value: "compartilhar", label: "Compartilhar", text: "Compartilha com quem precisa ver isso! 📲" },
    { value: "salvar", label: "Salvar", text: "Salva esse post pra não esquecer! 🔖" },
    { value: "link", label: "Link na Bio", text: "Link na bio! 🔗" },
    { value: "dm", label: "Chamar DM", text: "Me chama no direct! 💬" },
]

const mockCaptions = [
    "🚀 Transforme sua presença digital com estratégias que realmente funcionam!\n\nNão basta estar nas redes, é preciso se destacar. A Maya te ajuda a criar conteúdo que conecta, engaja e converte.\n\n✨ Planejamento inteligente\n📊 Métricas que importam\n🎯 Resultados reais",
    "Você sabia que 70% das marcas que planejam seu conteúdo têm resultados 3x melhores? 📈\n\nÉ hora de deixar a improvisação para trás e abraçar a estratégia!\n\nCom a Maya, você:\n→ Organiza sua produção\n→ Nunca perde prazos\n→ Cresce com consistência",
    "Por trás de todo perfil de sucesso, existe um calendário de conteúdo bem pensado. 📅\n\nA diferença entre postar por postar e postar com propósito está na estratégia.\n\nQuer descobrir como transformar seus posts em resultados? 👀",
]

export function CaptionGenerator({
    contentType,
    briefTitle,
    briefDescription,
    onCaptionGenerated
}: CaptionGeneratorProps) {
    const [generating, setGenerating] = useState(false)
    const [tone, setTone] = useState("profissional")
    const [cta, setCta] = useState("comentar")
    const [caption, setCaption] = useState("")
    const [hashtags, setHashtags] = useState<string[]>([])
    const [copied, setCopied] = useState(false)

    const generateCaption = async () => {
        setGenerating(true)

        // Simular delay de IA
        await new Promise(r => setTimeout(r, 1500))

        // Pegar caption aleatório do mock
        const randomCaption = mockCaptions[Math.floor(Math.random() * mockCaptions.length)]
        const selectedCta = ctaOptions.find(c => c.value === cta)

        const fullCaption = `${randomCaption}\n\n${selectedCta?.text || ""}`

        const generatedHashtags = [
            "marketing",
            "socialmedia",
            "conteudo",
            "estrategia",
            "digital",
            contentType.toLowerCase(),
            "maya"
        ]

        setCaption(fullCaption)
        setHashtags(generatedHashtags)
        setGenerating(false)

        toast.success("Caption gerada com sucesso!")
    }

    const copyToClipboard = () => {
        const fullText = `${caption}\n\n${hashtags.map(h => `#${h}`).join(" ")}`
        navigator.clipboard.writeText(fullText)
        setCopied(true)
        toast.success("Copiado para a área de transferência!")
        setTimeout(() => setCopied(false), 2000)
    }

    const applyCaption = () => {
        onCaptionGenerated?.(caption, hashtags)
        toast.success("Caption aplicada ao conteúdo!")
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Wand2 className="h-4 w-4 text-primary" />
                    Gerador de Caption com IA
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Context Info */}
                {(briefTitle || briefDescription) && (
                    <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                        {briefTitle && (
                            <p><strong>Título:</strong> {briefTitle}</p>
                        )}
                        {briefDescription && (
                            <p className="text-muted-foreground line-clamp-2">{briefDescription}</p>
                        )}
                    </div>
                )}

                {/* Options */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Tom de voz</Label>
                        <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {toneOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.emoji} {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Call to Action</Label>
                        <Select value={cta} onValueChange={setCta}>
                            <SelectTrigger className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ctaOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={generateCaption}
                    disabled={generating}
                    className="w-full"
                >
                    {generating ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Gerando...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Gerar Caption
                        </>
                    )}
                </Button>

                {/* Generated Caption */}
                {caption && (
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    Caption Gerada
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {caption.length} caracteres
                                </span>
                            </div>
                            <Textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                rows={6}
                                className="text-sm"
                            />
                        </div>

                        {/* Hashtags */}
                        <div className="space-y-1.5">
                            <Label className="text-xs flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                Hashtags Sugeridas
                            </Label>
                            <div className="flex flex-wrap gap-1">
                                {hashtags.map((tag, i) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => setHashtags(hashtags.filter((_, idx) => idx !== i))}
                                    >
                                        #{tag} ×
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={copyToClipboard}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 mr-1" />
                                ) : (
                                    <Copy className="h-4 w-4 mr-1" />
                                )}
                                {copied ? "Copiado!" : "Copiar"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generateCaption}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            {onCaptionGenerated && (
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={applyCaption}
                                >
                                    <Target className="h-4 w-4 mr-1" />
                                    Aplicar
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
