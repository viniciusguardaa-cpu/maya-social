"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Bell,
    Check,
    CheckCheck,
    MessageSquare,
    FileText,
    Sparkles,
    Calendar,
    Users
} from "lucide-react"

interface Notification {
    id: string
    type: "comment" | "approval" | "brief" | "schedule" | "team"
    title: string
    description: string
    read: boolean
    createdAt: string
}

const mockNotifications: Notification[] = [
    { id: "1", type: "comment", title: "Novo comentário", description: "Ana comentou em MAYA_RL_12", read: false, createdAt: "Há 5 min" },
    { id: "2", type: "approval", title: "Aprovação pendente", description: "MAYA_FD_08 aguarda sua aprovação", read: false, createdAt: "Há 30 min" },
    { id: "3", type: "brief", title: "Brief gerado", description: "Brief de MAYA_CA_05 está pronto", read: false, createdAt: "Há 1h" },
    { id: "4", type: "schedule", title: "Publicação agendada", description: "MAYA_RL_12 será publicado em 2h", read: true, createdAt: "Há 2h" },
    { id: "5", type: "team", title: "Novo membro", description: "João entrou na equipe", read: true, createdAt: "Há 3h" },
]

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    comment: { icon: <MessageSquare className="h-4 w-4" />, color: "text-blue-500" },
    approval: { icon: <FileText className="h-4 w-4" />, color: "text-amber-500" },
    brief: { icon: <Sparkles className="h-4 w-4" />, color: "text-purple-500" },
    schedule: { icon: <Calendar className="h-4 w-4" />, color: "text-green-500" },
    team: { icon: <Users className="h-4 w-4" />, color: "text-pink-500" },
}

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
    const [open, setOpen] = useState(false)

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ))
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b">
                    <h4 className="font-semibold">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Marcar todas
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma notificação</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const config = typeConfig[notification.type]
                                return (
                                    <div
                                        key={notification.id}
                                        className={`flex gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? "bg-primary/5" : ""
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className={`mt-0.5 ${config.color}`}>
                                            {config.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium truncate">
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {notification.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {notification.createdAt}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                        Ver todas as notificações
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
