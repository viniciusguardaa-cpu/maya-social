"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/lib/store"
import { approvalsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { CheckCircle, RefreshCw, RotateCcw, ThumbsDown } from "lucide-react"

interface PendingApprovalItem {
    id: string
    code: string
    type: string
    status: string
    scheduledAt?: string
    brief?: {
        title?: string
        description?: string
    }
    approvals?: Array<{
        id: string
        status: string
        reason?: string
        createdAt: string
        user?: {
            id: string
            name?: string
            email: string
        }
    }>
}

type ApprovalAction = "approve" | "reject" | "revision"

export default function ApprovalsPage() {
    const { currentOrg, currentBrand } = useAuthStore()

    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<PendingApprovalItem[]>([])

    const [actionOpen, setActionOpen] = useState(false)
    const [actionType, setActionType] = useState<ApprovalAction>("approve")
    const [activeItem, setActiveItem] = useState<PendingApprovalItem | null>(null)
    const [reason, setReason] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const canLoad = !!currentOrg?.id && !!currentBrand?.id

    const title = useMemo(() => {
        if (!currentBrand?.name) return "Aprovações"
        return `Aprovações — ${currentBrand.name}`
    }, [currentBrand?.name])

    const fetchPending = useCallback(async () => {
        if (!currentOrg?.id || !currentBrand?.id) return

        const orgId = currentOrg.id
        const brandId = currentBrand.id

        setLoading(true)
        try {
            const res = await approvalsApi.pending(orgId, brandId)
            setItems(res.data)
        } catch (error: any) {
            console.error("Failed to fetch pending approvals:", error)
            toast.error(error.response?.data?.message || "Erro ao carregar aprovações")
        } finally {
            setLoading(false)
        }
    }, [currentOrg?.id, currentBrand?.id])

    useEffect(() => {
        if (!canLoad) return
        fetchPending()
    }, [canLoad, fetchPending])

    const openAction = (type: ApprovalAction, item: PendingApprovalItem) => {
        setActionType(type)
        setActiveItem(item)
        setReason("")
        setActionOpen(true)
    }

    const submitAction = async () => {
        if (!currentOrg || !currentBrand || !activeItem) return

        if ((actionType === "reject" || actionType === "revision") && !reason.trim()) {
            toast.error("Informe um motivo")
            return
        }

        setSubmitting(true)
        try {
            if (actionType === "approve") {
                await approvalsApi.approve(currentOrg.id, currentBrand.id, activeItem.id, reason.trim() || undefined)
                toast.success("Conteúdo aprovado!")
            }

            if (actionType === "reject") {
                await approvalsApi.reject(currentOrg.id, currentBrand.id, activeItem.id, reason.trim())
                toast.success("Conteúdo rejeitado")
            }

            if (actionType === "revision") {
                await approvalsApi.requestRevision(currentOrg.id, currentBrand.id, activeItem.id, reason.trim())
                toast.success("Revisão solicitada")
            }

            setItems(prev => prev.filter(i => i.id !== activeItem.id))
            setActionOpen(false)
        } catch (error: any) {
            console.error("Failed to submit approval action:", error)
            toast.error(error.response?.data?.message || "Erro ao enviar ação")
        } finally {
            setSubmitting(false)
        }
    }

    if (!canLoad) {
        return (
            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold">Aprovações</h1>
                    <p className="text-muted-foreground">Selecione uma organização e uma marca.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-40 mt-2" />
                    </div>
                    <Skeleton className="h-9 w-28" />
                </div>
                <div className="grid gap-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-muted-foreground">
                        {items.length} pendente(s) de aprovação
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchPending}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            {items.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="font-medium">Tudo certo por aqui</p>
                        <p className="text-sm text-muted-foreground">Não há conteúdos aguardando aprovação.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {items.map((item) => {
                        const scheduled = item.scheduledAt
                            ? new Date(item.scheduledAt).toLocaleDateString("pt-BR", {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : null

                        return (
                            <Card key={item.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <CardTitle className="text-base">
                                                {item.brief?.title || item.code}
                                            </CardTitle>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-mono">{item.code}</span>
                                                <span>•</span>
                                                <Badge variant="outline">{item.type}</Badge>
                                                {scheduled && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{scheduled}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className="bg-yellow-500 text-white">Pendente</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {item.brief?.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {item.brief.description}
                                        </p>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                                        <Button
                                            variant="outline"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => openAction("reject", item)}
                                        >
                                            <ThumbsDown className="h-4 w-4 mr-2" />
                                            Rejeitar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => openAction("revision", item)}
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Pedir revisão
                                        </Button>
                                        <Button onClick={() => openAction("approve", item)}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Aprovar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Dialog open={actionOpen} onOpenChange={(open) => {
                setActionOpen(open)
                if (!open) {
                    setActiveItem(null)
                    setReason("")
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "approve" && "Aprovar conteúdo"}
                            {actionType === "reject" && "Rejeitar conteúdo"}
                            {actionType === "revision" && "Solicitar revisão"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {activeItem?.brief?.title || activeItem?.code}
                        </p>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={actionType === "approve" ? "Opcional: deixe um comentário" : "Descreva o motivo"}
                            rows={4}
                        />
                        {(actionType === "reject" || actionType === "revision") && (
                            <p className="text-xs text-muted-foreground">Motivo obrigatório</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionOpen(false)} disabled={submitting}>
                            Cancelar
                        </Button>
                        <Button onClick={submitAction} disabled={submitting}>
                            {submitting ? "Enviando..." : "Confirmar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
