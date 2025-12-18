"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    FileText,
    Sparkles,
    Check,
    Camera,
    Video,
    Smartphone,
    Layout,
    Megaphone
} from "lucide-react"
import { toast } from "sonner"

interface BriefTemplate {
    id: string
    name: string
    type: string
    icon: React.ReactNode
    description: string
    template: {
        title: string
        description: string
        objective: string
        cta: string
        hashtags: string[]
    }
}

const templates: BriefTemplate[] = [
    {
        id: "feed-produto",
        name: "Feed - Produto",
        type: "FEED",
        icon: <Camera className="h-5 w-5" />,
        description: "Post de divulgação de produto ou serviço",
        template: {
            title: "Lançamento de [Produto]",
            description: "Post destacando os principais benefícios e diferenciais do produto. Usar foto de alta qualidade com fundo neutro. Incluir preço e condições especiais se houver.",
            objective: "Gerar interesse e conversões",
            cta: "Link na bio para comprar!",
            hashtags: ["lancamento", "novidade", "produto", "oferta"]
        }
    },
    {
        id: "feed-educativo",
        name: "Feed - Educativo",
        type: "FEED",
        icon: <Camera className="h-5 w-5" />,
        description: "Conteúdo informativo e de valor",
        template: {
            title: "X Dicas sobre [Tema]",
            description: "Carrossel ou post único com dicas práticas e aplicáveis. Usar design limpo com texto legível. Incluir dados ou estatísticas quando possível.",
            objective: "Educar e gerar autoridade",
            cta: "Salva esse post pra não esquecer!",
            hashtags: ["dicas", "aprenda", "conhecimento", "educativo"]
        }
    },
    {
        id: "reels-trend",
        name: "Reels - Trend",
        type: "REELS",
        icon: <Video className="h-5 w-5" />,
        description: "Reels seguindo trend viral",
        template: {
            title: "Trend: [Nome da Trend]",
            description: "Vídeo vertical adaptando a trend atual para o contexto da marca. Manter timing original da trend. Adicionar personalidade da marca.",
            objective: "Alcance e viralização",
            cta: "Marca alguém que precisa ver isso!",
            hashtags: ["reels", "viral", "trend", "foryou"]
        }
    },
    {
        id: "reels-tutorial",
        name: "Reels - Tutorial",
        type: "REELS",
        icon: <Video className="h-5 w-5" />,
        description: "Tutorial rápido e prático",
        template: {
            title: "Como fazer [Ação] em X passos",
            description: "Tutorial passo a passo de 15-60 segundos. Mostrar processo de forma clara e dinâmica. Usar texto na tela para reforçar os passos.",
            objective: "Valor e engajamento",
            cta: "Comenta se funcionou pra você!",
            hashtags: ["tutorial", "comofazer", "aprenda", "passoapasso"]
        }
    },
    {
        id: "stories-enquete",
        name: "Stories - Enquete",
        type: "STORIES",
        icon: <Smartphone className="h-5 w-5" />,
        description: "Stories interativo com enquete",
        template: {
            title: "Enquete: [Pergunta]",
            description: "Story com enquete para gerar interação. Usar fundo chamativo e texto grande. Seguir com story revelando resultado.",
            objective: "Engajamento e insights",
            cta: "Vota aí!",
            hashtags: []
        }
    },
    {
        id: "stories-bastidores",
        name: "Stories - Bastidores",
        type: "STORIES",
        icon: <Smartphone className="h-5 w-5" />,
        description: "Conteúdo de bastidores autêntico",
        template: {
            title: "Bastidores: [Contexto]",
            description: "Mostrar o dia a dia, processo de trabalho ou making of. Manter tom casual e autêntico. Usar música de fundo quando apropriado.",
            objective: "Humanização e conexão",
            cta: "Quer ver mais bastidores?",
            hashtags: []
        }
    },
    {
        id: "carousel-lista",
        name: "Carrossel - Lista",
        type: "CAROUSEL",
        icon: <Layout className="h-5 w-5" />,
        description: "Carrossel com lista de itens",
        template: {
            title: "X [Itens] que você precisa conhecer",
            description: "Carrossel de 5-10 slides com um item por slide. Capa chamativa, slides com design consistente, última slide com CTA forte.",
            objective: "Salvamentos e compartilhamentos",
            cta: "Qual é o seu favorito? Comenta!",
            hashtags: ["carrossel", "lista", "top", "melhores"]
        }
    },
    {
        id: "ad-conversao",
        name: "Ad - Conversão",
        type: "AD",
        icon: <Megaphone className="h-5 w-5" />,
        description: "Anúncio focado em conversão",
        template: {
            title: "Oferta: [Produto/Serviço]",
            description: "Criativo de anúncio com foco em conversão. Destacar benefício principal, incluir prova social, e urgência. CTA claro e direto.",
            objective: "Conversões e vendas",
            cta: "Aproveite agora - Oferta por tempo limitado!",
            hashtags: ["ad"]
        }
    }
]

interface BriefTemplatesProps {
    contentType?: string
    onSelectTemplate?: (template: BriefTemplate["template"]) => void
}

export function BriefTemplates({ contentType, onSelectTemplate }: BriefTemplatesProps) {
    const [open, setOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const filteredTemplates = contentType
        ? templates.filter(t => t.type === contentType)
        : templates

    const handleSelect = (template: BriefTemplate) => {
        setSelectedId(template.id)
        onSelectTemplate?.(template.template)
        toast.success(`Template "${template.name}" aplicado!`)
        setTimeout(() => {
            setOpen(false)
            setSelectedId(null)
        }, 500)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Usar Template
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Templates de Brief
                    </DialogTitle>
                </DialogHeader>

                <div className="grid sm:grid-cols-2 gap-3">
                    {filteredTemplates.map((template) => (
                        <Card
                            key={template.id}
                            className={`cursor-pointer transition-all hover:border-primary ${selectedId === template.id ? "border-primary bg-primary/5" : ""
                                }`}
                            onClick={() => handleSelect(template)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            {template.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm">{template.name}</CardTitle>
                                            <Badge variant="secondary" className="text-xs mt-0.5">
                                                {template.type}
                                            </Badge>
                                        </div>
                                    </div>
                                    {selectedId === template.id && (
                                        <Check className="h-5 w-5 text-primary" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {template.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum template disponível para este tipo</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
