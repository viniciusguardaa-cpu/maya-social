"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    MoreVertical,
    Pencil,
    Trash2,
    Crown,
    Users,
    Clock,
    CheckCircle
} from "lucide-react"

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

const mockTeam: TeamMember[] = [
    { id: "1", name: "Vinicius Garcia", email: "vinicius@maya.com", role: "OWNER", status: "active", lastActive: "Agora", joinedAt: "2024-01-01" },
    { id: "2", name: "Ana Silva", email: "ana@maya.com", role: "ADMIN", status: "active", lastActive: "Há 2h", joinedAt: "2024-02-15" },
    { id: "3", name: "Carlos Santos", email: "carlos@maya.com", role: "MANAGER", status: "active", lastActive: "Há 1 dia", joinedAt: "2024-03-20" },
    { id: "4", name: "Maria Oliveira", email: "maria@maya.com", role: "PRODUCER", status: "active", lastActive: "Há 3h", joinedAt: "2024-04-10" },
    { id: "5", name: "João Costa", email: "joao@maya.com", role: "PRODUCER", status: "pending", joinedAt: "2025-01-15" },
    { id: "6", name: "Beatriz Lima", email: "beatriz@maya.com", role: "SUPPORT", status: "active", lastActive: "Há 5h", joinedAt: "2024-06-01" },
]

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
    OWNER: { label: "Dono", color: "bg-amber-500", icon: <Crown className="h-3 w-3" />, description: "Acesso total ao sistema" },
    ADMIN: { label: "Admin", color: "bg-red-500", icon: <Shield className="h-3 w-3" />, description: "Gerencia equipe e configurações" },
    MANAGER: { label: "Gerente", color: "bg-blue-500", icon: <Users className="h-3 w-3" />, description: "Aprova conteúdos e gerencia calendário" },
    PRODUCER: { label: "Produtor", color: "bg-green-500", icon: <Pencil className="h-3 w-3" />, description: "Cria e edita conteúdos" },
    SUPPORT: { label: "Suporte", color: "bg-gray-500", icon: <Mail className="h-3 w-3" />, description: "Visualiza e comenta" },
}

const roleOptions = ["ADMIN", "MANAGER", "PRODUCER", "SUPPORT"]

export default function TeamPage() {
    const { currentOrg } = useAuthStore()
    const [team, setTeam] = useState<TeamMember[]>(mockTeam)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "PRODUCER" as TeamMember["role"],
    })

    const openInviteDialog = () => {
        setEditingMember(null)
        setFormData({ name: "", email: "", role: "PRODUCER" })
        setDialogOpen(true)
    }

    const openEditDialog = (member: TeamMember) => {
        setEditingMember(member)
        setFormData({ name: member.name, email: member.email, role: member.role })
        setDialogOpen(true)
    }

    const handleSave = () => {
        if (editingMember) {
            setTeam(prev => prev.map(m =>
                m.id === editingMember.id
                    ? { ...m, ...formData }
                    : m
            ))
        } else {
            const newMember: TeamMember = {
                id: Date.now().toString(),
                ...formData,
                status: "pending",
                joinedAt: new Date().toISOString().split("T")[0],
            }
            setTeam(prev => [...prev, newMember])
        }
        setDialogOpen(false)
    }

    const handleRemove = (id: string) => {
        if (!confirm("Tem certeza que deseja remover este membro?")) return
        setTeam(prev => prev.filter(m => m.id !== id))
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
                <Button onClick={openInviteDialog}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar Membro
                </Button>
            </div>

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
                {team.map((member) => {
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

                                    {member.role !== "OWNER" && (
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
                })}
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
                                    { perm: "Aprovar conteúdos", roles: [true, true, true, false, false] },
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
                            <Label>Nome</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nome completo"
                            />
                        </div>

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
                        <Button onClick={handleSave} disabled={!formData.name || !formData.email}>
                            {editingMember ? "Salvar" : "Enviar Convite"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
