"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Webhook,
    Plus,
    Trash2,
    Check,
    AlertCircle,
    Send,
    MessageSquare,
    Bell
} from "lucide-react"
import { toast } from "sonner"

interface WebhookConfig {
    id: string
    name: string
    type: "slack" | "discord" | "custom"
    url: string
    events: string[]
    isActive: boolean
    lastTriggered?: string
}

const eventOptions = [
    { id: "content.created", label: "Conteúdo criado" },
    { id: "content.approved", label: "Conteúdo aprovado" },
    { id: "content.published", label: "Conteúdo publicado" },
    { id: "brief.generated", label: "Brief gerado" },
    { id: "comment.added", label: "Comentário adicionado" },
    { id: "team.invited", label: "Membro convidado" },
]

const mockWebhooks: WebhookConfig[] = [
    {
        id: "1",
        name: "Slack - Marketing",
        type: "slack",
        url: "https://hooks.slack.com/services/xxx",
        events: ["content.approved", "content.published"],
        isActive: true,
        lastTriggered: "Há 2h"
    },
    {
        id: "2",
        name: "Discord - Team",
        type: "discord",
        url: "https://discord.com/api/webhooks/xxx",
        events: ["content.created", "brief.generated"],
        isActive: true,
        lastTriggered: "Há 5h"
    },
]

export function WebhookIntegrations() {
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>(mockWebhooks)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newWebhook, setNewWebhook] = useState({
        name: "",
        type: "slack" as "slack" | "discord" | "custom",
        url: "",
        events: [] as string[]
    })

    const toggleEvent = (eventId: string) => {
        setNewWebhook(prev => ({
            ...prev,
            events: prev.events.includes(eventId)
                ? prev.events.filter(e => e !== eventId)
                : [...prev.events, eventId]
        }))
    }

    const createWebhook = () => {
        if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
            toast.error("Preencha todos os campos")
            return
        }

        const webhook: WebhookConfig = {
            id: Date.now().toString(),
            ...newWebhook,
            isActive: true
        }

        setWebhooks([...webhooks, webhook])
        setNewWebhook({ name: "", type: "slack", url: "", events: [] })
        setIsCreateOpen(false)
        toast.success("Webhook criado com sucesso!")
    }

    const toggleWebhook = (id: string) => {
        setWebhooks(webhooks.map(w =>
            w.id === id ? { ...w, isActive: !w.isActive } : w
        ))
    }

    const deleteWebhook = (id: string) => {
        setWebhooks(webhooks.filter(w => w.id !== id))
        toast.success("Webhook removido")
    }

    const testWebhook = (webhook: WebhookConfig) => {
        toast.success(`Teste enviado para ${webhook.name}!`)
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "slack": return "💬"
            case "discord": return "🎮"
            default: return "🔗"
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Webhook className="h-4 w-4 text-primary" />
                        Integrações Webhook
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
                                <DialogTitle>Adicionar Webhook</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome</Label>
                                    <Input
                                        placeholder="Ex: Slack Marketing"
                                        value={newWebhook.name}
                                        onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <div className="flex gap-2">
                                        {(["slack", "discord", "custom"] as const).map((type) => (
                                            <Button
                                                key={type}
                                                variant={newWebhook.type === type ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setNewWebhook({ ...newWebhook, type })}
                                            >
                                                {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>URL do Webhook</Label>
                                    <Input
                                        placeholder="https://hooks.slack.com/..."
                                        value={newWebhook.url}
                                        onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Eventos</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {eventOptions.map((event) => (
                                            <div
                                                key={event.id}
                                                onClick={() => toggleEvent(event.id)}
                                                className={`p-2 rounded-lg border cursor-pointer text-sm transition-colors ${newWebhook.events.includes(event.id)
                                                        ? "border-primary bg-primary/5"
                                                        : "hover:bg-muted"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full border ${newWebhook.events.includes(event.id)
                                                            ? "bg-primary border-primary"
                                                            : "border-muted-foreground"
                                                        }`} />
                                                    {event.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button onClick={createWebhook} className="w-full">
                                    <Check className="h-4 w-4 mr-2" />
                                    Criar Webhook
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {webhooks.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Webhook className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum webhook configurado</p>
                    </div>
                ) : (
                    webhooks.map((webhook) => (
                        <div
                            key={webhook.id}
                            className={`p-3 rounded-lg border transition-opacity ${webhook.isActive ? "" : "opacity-50"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getTypeIcon(webhook.type)}</span>
                                    <div>
                                        <p className="font-medium text-sm">{webhook.name}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {webhook.url}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => testWebhook(webhook)}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                    <Switch
                                        checked={webhook.isActive}
                                        onCheckedChange={() => toggleWebhook(webhook.id)}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive"
                                        onClick={() => deleteWebhook(webhook.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                {webhook.events.slice(0, 2).map((e) => (
                                    <Badge key={e} variant="secondary" className="text-xs">
                                        {eventOptions.find(o => o.id === e)?.label}
                                    </Badge>
                                ))}
                                {webhook.events.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{webhook.events.length - 2}
                                    </Badge>
                                )}
                                {webhook.lastTriggered && (
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        Último: {webhook.lastTriggered}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
