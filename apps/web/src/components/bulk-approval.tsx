"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Check,
    X,
    Loader2,
    ListChecks
} from "lucide-react"
import { toast } from "sonner"

interface ContentItem {
    id: string
    code: string
    title: string
    type: string
    status: string
    scheduledAt?: string
}

const mockPendingContent: ContentItem[] = [
    { id: "1", code: "MAYA_RL_12", title: "Reels: Dicas de Marketing", type: "REELS", status: "AWAITING_APPROVAL", scheduledAt: "2025-01-20T10:00:00" },
    { id: "2", code: "MAYA_FD_08", title: "Post: Novidades do Mês", type: "FEED", status: "AWAITING_APPROVAL", scheduledAt: "2025-01-21T12:00:00" },
    { id: "3", code: "MAYA_CA_05", title: "Carrossel: 5 Tendências", type: "CAROUSEL", status: "AWAITING_APPROVAL", scheduledAt: "2025-01-22T18:00:00" },
    { id: "4", code: "MAYA_ST_03", title: "Stories: Bastidores", type: "STORIES", status: "AWAITING_APPROVAL" },
    { id: "5", code: "MAYA_RL_13", title: "Reels: Tutorial Rápido", type: "REELS", status: "AWAITING_APPROVAL", scheduledAt: "2025-01-23T14:00:00" },
]

const typeIcons: Record<string, string> = {
    FEED: "📷",
    REELS: "🎬",
    STORIES: "📱",
    CAROUSEL: "🎠",
}

interface BulkApprovalProps {
    onApprove?: (ids: string[]) => void
    onReject?: (ids: string[]) => void
}

export function BulkApproval({ onApprove, onReject }: BulkApprovalProps) {
    const [content, setContent] = useState<ContentItem[]>(mockPendingContent)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const selectAll = () => {
        if (selectedIds.length === content.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(content.map(c => c.id))
        }
    }

    const handleApprove = async () => {
        if (selectedIds.length === 0) return

        setIsProcessing(true)
        await new Promise(r => setTimeout(r, 1000))

        onApprove?.(selectedIds)
        setContent(content.filter(c => !selectedIds.includes(c.id)))
        toast.success(`${selectedIds.length} conteúdo(s) aprovado(s)!`)
        setSelectedIds([])
        setIsProcessing(false)

        if (content.length - selectedIds.length === 0) {
            setIsOpen(false)
        }
    }

    const handleReject = async () => {
        if (selectedIds.length === 0) return

        setIsProcessing(true)
        await new Promise(r => setTimeout(r, 1000))

        onReject?.(selectedIds)
        setContent(content.filter(c => !selectedIds.includes(c.id)))
        toast.success(`${selectedIds.length} conteúdo(s) rejeitado(s)`)
        setSelectedIds([])
        setIsProcessing(false)

        if (content.length - selectedIds.length === 0) {
            setIsOpen(false)
        }
    }

    const pendingCount = content.length

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="relative">
                    <ListChecks className="h-4 w-4 mr-2" />
                    Aprovações
                    {pendingCount > 0 && (
                        <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                            {pendingCount}
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        Aprovação em Lote
                        <Badge variant="secondary">{pendingCount} pendentes</Badge>
                    </DialogTitle>
                </DialogHeader>

                {content.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <CheckCircle className="h-16 w-16 mb-4 text-green-500" />
                        <p className="text-lg font-medium">Tudo aprovado!</p>
                        <p className="text-sm">Não há conteúdos pendentes de aprovação</p>
                    </div>
                ) : (
                    <>
                        {/* Select All */}
                        <div className="flex items-center justify-between py-2 border-b">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={selectedIds.length === content.length}
                                    onCheckedChange={selectAll}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {selectedIds.length > 0
                                        ? `${selectedIds.length} selecionado(s)`
                                        : "Selecionar todos"
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Content List */}
                        <div className="flex-1 overflow-y-auto space-y-2 py-2">
                            {content.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedIds.includes(item.id)
                                            ? "border-primary bg-primary/5"
                                            : "hover:bg-muted/50"
                                        }`}
                                    onClick={() => toggleSelect(item.id)}
                                >
                                    <Checkbox
                                        checked={selectedIds.includes(item.id)}
                                        onCheckedChange={() => toggleSelect(item.id)}
                                    />
                                    <span className="text-xl">{typeIcons[item.type] || "📄"}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="font-mono">{item.code}</span>
                                            {item.scheduledAt && (
                                                <>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(item.scheduledAt).toLocaleDateString("pt-BR", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="outline">{item.type}</Badge>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <DialogFooter className="border-t pt-4">
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="outline"
                                    className="flex-1 text-destructive hover:text-destructive"
                                    onClick={handleReject}
                                    disabled={selectedIds.length === 0 || isProcessing}
                                >
                                    {isProcessing ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <XCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Rejeitar ({selectedIds.length})
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleApprove}
                                    disabled={selectedIds.length === 0 || isProcessing}
                                >
                                    {isProcessing ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Aprovar ({selectedIds.length})
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
