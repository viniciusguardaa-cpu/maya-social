"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    History,
    RotateCcw,
    Clock,
    User,
    ChevronRight,
    Check,
    Diff
} from "lucide-react"
import { toast } from "sonner"

interface BriefVersion {
    id: string
    version: number
    title: string
    description: string
    objective: string
    cta: string
    hashtags: string[]
    author: string
    createdAt: string
    isCurrent: boolean
}

const mockVersions: BriefVersion[] = [
    {
        id: "v4",
        version: 4,
        title: "Reels: 5 Dicas de Marketing Digital",
        description: "Vídeo vertical com 5 dicas práticas de marketing digital para pequenas empresas. Usar transições rápidas e texto na tela.",
        objective: "Educar e gerar autoridade",
        cta: "Salva pra não esquecer!",
        hashtags: ["marketing", "dicas", "digital", "negocios"],
        author: "Ana Silva",
        createdAt: "Há 10 min",
        isCurrent: true
    },
    {
        id: "v3",
        version: 3,
        title: "Reels: Dicas de Marketing",
        description: "Vídeo com dicas de marketing. Transições dinâmicas.",
        objective: "Educar audiência",
        cta: "Comenta sua dúvida!",
        hashtags: ["marketing", "dicas"],
        author: "Carlos Santos",
        createdAt: "Há 2h",
        isCurrent: false
    },
    {
        id: "v2",
        version: 2,
        title: "Reels: Marketing Tips",
        description: "Quick tips for digital marketing.",
        objective: "Education",
        cta: "Follow for more!",
        hashtags: ["marketing"],
        author: "Ana Silva",
        createdAt: "Há 1 dia",
        isCurrent: false
    },
    {
        id: "v1",
        version: 1,
        title: "Rascunho inicial",
        description: "Ideias para reels de marketing.",
        objective: "",
        cta: "",
        hashtags: [],
        author: "Sistema (IA)",
        createdAt: "Há 2 dias",
        isCurrent: false
    },
]

interface BriefHistoryProps {
    contentId: string
    onRestore?: (version: BriefVersion) => void
}

export function BriefHistory({ contentId, onRestore }: BriefHistoryProps) {
    const [versions, setVersions] = useState<BriefVersion[]>(mockVersions)
    const [selectedVersion, setSelectedVersion] = useState<BriefVersion | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const handleRestore = (version: BriefVersion) => {
        setVersions(versions.map(v => ({
            ...v,
            isCurrent: v.id === version.id
        })))
        onRestore?.(version)
        toast.success(`Versão ${version.version} restaurada!`)
        setSelectedVersion(null)
    }

    const currentVersion = versions.find(v => v.isCurrent)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <History className="h-4 w-4 mr-1" />
                    Histórico
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Histórico de Versões
                        <Badge variant="secondary">{versions.length} versões</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-4 flex-1 overflow-hidden">
                    {/* Version List */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-2 border-b">
                            <p className="text-sm font-medium">Versões</p>
                        </div>
                        <ScrollArea className="h-[400px]">
                            <div className="p-2 space-y-1">
                                {versions.map((version) => (
                                    <button
                                        key={version.id}
                                        onClick={() => setSelectedVersion(version)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedVersion?.id === version.id
                                                ? "bg-primary/10 border border-primary"
                                                : "hover:bg-muted"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={version.isCurrent ? "default" : "outline"}>
                                                    v{version.version}
                                                </Badge>
                                                {version.isCurrent && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Atual
                                                    </Badge>
                                                )}
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium truncate">{version.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <User className="h-3 w-3" />
                                            <span>{version.author}</span>
                                            <span>•</span>
                                            <Clock className="h-3 w-3" />
                                            <span>{version.createdAt}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Version Details */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-2 border-b flex items-center justify-between">
                            <p className="text-sm font-medium">Detalhes</p>
                            {selectedVersion && !selectedVersion.isCurrent && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRestore(selectedVersion)}
                                >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Restaurar
                                </Button>
                            )}
                        </div>
                        <ScrollArea className="h-[400px]">
                            {selectedVersion ? (
                                <div className="p-4 space-y-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Título</p>
                                        <p className="text-sm font-medium">{selectedVersion.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                                        <p className="text-sm">{selectedVersion.description || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Objetivo</p>
                                        <p className="text-sm">{selectedVersion.objective || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">CTA</p>
                                        <p className="text-sm">{selectedVersion.cta || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Hashtags</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedVersion.hashtags.length > 0 ? (
                                                selectedVersion.hashtags.map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        #{tag}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                                    <Diff className="h-12 w-12 mb-2 opacity-50" />
                                    <p className="text-sm">Selecione uma versão para ver os detalhes</p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
