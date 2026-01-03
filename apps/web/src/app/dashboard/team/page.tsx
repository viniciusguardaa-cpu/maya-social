"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/lib/store"
import { organizationsApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    UserPlus,
    Mail,
    Shield,
    Pencil,
    Trash2,
    Crown,
    Users,
    Clock,
    CheckCircle,
    Loader2,
    RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface TeamMember {
    id: string
    name: string
    email: string
    role: "OWNER" | "ADMIN" | "MANAGER" | "PRODUCER" | "SUPPORT"
    avatar?: string
    status: "active" | "pending" | "inactive"
    lastActive?: string
    joinedAt: string
}

interface ApiMembership {
    id: string
    role: TeamMember["role"]
    createdAt: string
    user: {
        id: string
        name: string | null
        email: string
        avatar: string | null
    }
}

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
    OWNER: { label: "Dono", color: "bg-amber-500", icon: <Crown className="h-3 w-3" />, description: "Acesso total ao sistema" },
    ADMIN: { label: "Admin", color: "bg-red-500", icon: <Shield className="h-3 w-3" />, description: "Gerencia equipe e configurações" },
    MANAGER: { label: "Gerente", color: "bg-blue-500", icon: <Users className="h-3 w-3" />, description: "Aprova conteúdos e gerencia calendário" },
    PRODUCER: { label: "Produtor", color: "bg-green-500", icon: <Pencil className="h-3 w-3" />, description: "Cria e edita conteúdos" },
    SUPPORT: { label: "Cliente", color: "bg-gray-500", icon: <Mail className="h-3 w-3" />, description: "Aprova e pede ajustes" },
}

const roleOptions = ["ADMIN", "MANAGER", "PRODUCER", "SUPPORT"]

export default function TeamPage() {
    const { currentOrg } = useAuthStore()
    const [team, setTeam] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [formData, setFormData] = useState({
        email: "",
        role: "PRODUCER" as TeamMember["role"],
    })

    const canManageTeam = useMemo(() => {
        if (!currentOrg?.role) return false
        return currentOrg.role === "OWNER" || currentOrg.role === "ADMIN"
    }, [currentOrg?.role])

    const mapMembership = useCallback((m: ApiMembership): TeamMember => {
        const fallbackName = m.user.email.split("@")[0]
        return {
            id: m.id,
            name: m.user.name || fallbackName,
            email: m.user.email,
            role: m.role,
            avatar: m.user.avatar || undefined,
            status: "active",
            joinedAt: new Date(m.createdAt).toISOString().split("T")[0],
        }
    }, [])

    const fetchMembers = useCallback(async () => {
        if (!currentOrg?.id) return
        if (!canManageTeam) return
        const orgId = currentOrg.id

        setLoading(true)
        try {
            const res = await organizationsApi.members.list(orgId)
            setTeam((res.data as ApiMembership[]).map(mapMembership))
        } catch (error: any) {
            console.error("Failed to fetch members:", error)
            toast.error(error.response?.data?.message || "Erro ao carregar membros")
        } finally {
            setLoading(false)
        }
    }, [currentOrg?.id, canManageTeam, mapMembership])

    useEffect(() => {
        if (!currentOrg?.id) return
        if (!canManageTeam) {
            setLoading(false)
            return
        }

        fetchMembers()
    }, [currentOrg?.id, canManageTeam, fetchMembers])

    const openInviteDialog = () => {
        setEditingMember(null)
        setFormData({ email: "", role: "PRODUCER" })
        setDialogOpen(true)
    }

    const openEditDialog = (member: TeamMember) => {
        setEditingMember(member)
        setFormData({ email: member.email, role: member.role })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!currentOrg?.id) return
        if (!formData.email) return

        setSaving(true)
        try {
            if (editingMember) {
                const res = await organizationsApi.members.updateRole(
                    currentOrg.id,
                    editingMember.id,
                    formData.role,
                )
                const updated = mapMembership(res.data as ApiMembership)
                setTeam(prev => prev.map(m => (m.id === updated.id ? { ...m, role: updated.role } : m)))
                toast.success("Função atualizada")
            } else {
                const res = await organizationsApi.members.add(currentOrg.id, {
                    email: formData.email,
                    role: formData.role,
                })
                const created = mapMembership(res.data as ApiMembership)
                setTeam(prev => [created, ...prev])
                toast.success("Membro adicionado")
            }
            setDialogOpen(false)
        } catch (error: any) {
            console.error("Failed to save member:", error)
            toast.error(error.response?.data?.message || "Erro ao salvar membro")
        } finally {
            setSaving(false)
        }
    }

    const handleRemove = async (id: string) => {
        if (!currentOrg?.id) return
        if (!confirm("Tem certeza que deseja remover este membro?")) return

        try {
            await organizationsApi.members.remove(currentOrg.id, id)
            setTeam(prev => prev.filter(m => m.id !== id))
            toast.success("Membro removido")
        } catch (error: any) {
            console.error("Failed to remove member:", error)
            toast.error(error.response?.data?.message || "Erro ao remover membro")
        }
    }

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const stats = {
        total: team.length,
        active: team.filter(m => m.status === "active").length,
        pending: team.filter(m => m.status === "pending").length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Equipe</h1>
                    <p className="text-muted-foreground">
                        {stats.total} membros • {stats.active} ativos • {stats.pending} pendentes
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchMembers} disabled={!currentOrg?.id || loading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                    </Button>
                    <Button onClick={openInviteDialog} disabled={!canManageTeam}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Convidar
                    </Button>
                </div>
            </div>

            {!canManageTeam && (
                <Card>
                    <CardContent className="py-4 text-sm text-muted-foreground">
                        Apenas <span className="font-medium text-foreground">OWNER</span> e <span className="font-medium text-foreground">ADMIN</span> podem gerenciar a equipe.
                    </CardContent>
                </Card>
            )}

            {/* Role Legend */}
            <div className="flex flex-wrap gap-4">
                {Object.entries(roleConfig).map(([role, config]) => (
                    <div key={role} className="flex items-center gap-2">
                        <Badge className={`${config.color} text-white`}>
                            {config.icon}
                            <span className="ml-1">{config.label}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                            {config.description}
                        </span>
                    </div>
                ))}
            </div>

            {/* Team Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-40" />
                                        <Skeleton className="h-6 w-24" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    team.map((member) => {
                        const role = roleConfig[member.role]
                        return (
                            <Card key={member.id} className={member.status === "pending" ? "opacity-70" : ""}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium truncate">{member.name}</p>
                                                {member.status === "pending" && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        <Clock className="h-2 w-2 mr-1" />
                                                        Pendente
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge className={`${role.color} text-white text-xs`}>
                                                    {role.icon}
                                                    <span className="ml-1">{role.label}</span>
                                                </Badge>
                                                {member.lastActive && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                                        {member.lastActive}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {member.role !== "OWNER" && canManageTeam && (
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openEditDialog(member)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => handleRemove(member.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* Permissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Permissões por Função</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-4">Permissão</th>
                                    <th className="text-center py-2 px-4">Dono</th>
                                    <th className="text-center py-2 px-4">Admin</th>
                                    <th className="text-center py-2 px-4">Gerente</th>
                                    <th className="text-center py-2 px-4">Produtor</th>
                                    <th className="text-center py-2 px-4">Suporte</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {[
                                    { perm: "Gerenciar equipe", roles: [true, true, false, false, false] },
                                    { perm: "Configurações da marca", roles: [true, true, false, false, false] },
                                    { perm: "Aprovar conteúdos", roles: [true, true, true, false, true] },
                                    { perm: "Gerar calendário", roles: [true, true, true, false, false] },
                                    { perm: "Criar/editar conteúdos", roles: [true, true, true, true, false] },
                                    { perm: "Upload de assets", roles: [true, true, true, true, false] },
                                    { perm: "Visualizar analytics", roles: [true, true, true, true, true] },
                                    { perm: "Comentar", roles: [true, true, true, true, true] },
                                ].map((row, i) => (
                                    <tr key={i}>
                                        <td className="py-2 px-4">{row.perm}</td>
                                        {row.roles.map((allowed, j) => (
                                            <td key={j} className="text-center py-2 px-4">
                                                {allowed ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Invite/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingMember ? "Editar Membro" : "Convidar Membro"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@exemplo.com"
                                disabled={!!editingMember}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Função</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(v: TeamMember["role"]) => setFormData({ ...formData, role: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {roleOptions.map((role) => {
                                        const config = roleConfig[role]
                                        return (
                                            <SelectItem key={role} value={role}>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${config.color} text-white text-xs`}>
                                                        {config.icon}
                                                    </Badge>
                                                    {config.label}
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {roleConfig[formData.role]?.description}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={!formData.email || saving}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingMember ? "Salvar" : "Convidar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
