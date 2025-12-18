"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Save,
    Loader2,
    CheckCircle,
    Moon,
    Sun,
    Smartphone,
    Mail,
    Lock,
    LogOut,
    Trash2
} from "lucide-react"

interface NotificationSettings {
    email: boolean
    push: boolean
    contentApproval: boolean
    newComments: boolean
    weeklyReport: boolean
    marketingEmails: boolean
}

export default function SettingsPage() {
    const { user, logout } = useAuthStore()
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
    const [language, setLanguage] = useState("pt-BR")

    const [profile, setProfile] = useState({
        name: user?.name || "Demo User",
        email: user?.email || "demo@maya.com",
    })

    const [notifications, setNotifications] = useState<NotificationSettings>({
        email: true,
        push: true,
        contentApproval: true,
        newComments: true,
        weeklyReport: true,
        marketingEmails: false,
    })

    const handleSave = async () => {
        setSaving(true)
        await new Promise(r => setTimeout(r, 1000))
        setSaving(false)
        setSaved(true)
        toast.success("Configurações salvas com sucesso!")
        setTimeout(() => setSaved(false), 3000)
    }

    const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
        setTheme(newTheme)
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark")
        } else if (newTheme === "light") {
            document.documentElement.classList.remove("dark")
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
            document.documentElement.classList.toggle("dark", prefersDark)
        }
        localStorage.setItem("theme", newTheme)
    }

    const toggleNotification = (key: keyof NotificationSettings) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const handleLogout = () => {
        logout()
        window.location.href = "/login"
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Configurações</h1>
                    <p className="text-muted-foreground">
                        Gerencie sua conta e preferências
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : saved ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {saved ? "Salvo!" : "Salvar"}
                </Button>
            </div>

            {/* Profile */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Perfil
                    </CardTitle>
                    <CardDescription>Suas informações pessoais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                {getInitials(profile.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <Button variant="outline" size="sm">Alterar Foto</Button>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Aparência
                    </CardTitle>
                    <CardDescription>Personalize a interface</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tema</Label>
                        <div className="flex gap-2">
                            {([
                                { value: "light", icon: Sun, label: "Claro" },
                                { value: "dark", icon: Moon, label: "Escuro" },
                                { value: "system", icon: Smartphone, label: "Sistema" },
                            ] as const).map(({ value, icon: Icon, label }) => (
                                <Button
                                    key={value}
                                    variant={theme === value ? "default" : "outline"}
                                    className="flex-1"
                                    onClick={() => handleThemeChange(value)}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Idioma</Label>
                        <div className="flex gap-2">
                            {[
                                { value: "pt-BR", label: "🇧🇷 Português" },
                                { value: "en-US", label: "🇺🇸 English" },
                                { value: "es-ES", label: "🇪🇸 Español" },
                            ].map(({ value, label }) => (
                                <Button
                                    key={value}
                                    variant={language === value ? "default" : "outline"}
                                    className="flex-1"
                                    onClick={() => setLanguage(value)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notificações
                    </CardTitle>
                    <CardDescription>Configure como você quer ser notificado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        { key: "email" as const, icon: Mail, title: "Notificações por Email", desc: "Receba atualizações no seu email" },
                        { key: "push" as const, icon: Bell, title: "Push Notifications", desc: "Notificações no navegador" },
                        { key: "contentApproval" as const, icon: CheckCircle, title: "Aprovação de Conteúdo", desc: "Quando um conteúdo precisa de aprovação" },
                        { key: "newComments" as const, icon: Mail, title: "Novos Comentários", desc: "Quando alguém comenta em um conteúdo" },
                        { key: "weeklyReport" as const, icon: Mail, title: "Relatório Semanal", desc: "Resumo de performance toda segunda" },
                        { key: "marketingEmails" as const, icon: Mail, title: "Emails de Marketing", desc: "Novidades e dicas do Maya" },
                    ].map(({ key, icon: Icon, title, desc }) => (
                        <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{title}</p>
                                    <p className="text-sm text-muted-foreground">{desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleNotification(key)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? "bg-primary" : "bg-muted"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications[key] ? "left-6" : "left-1"
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Security */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Segurança
                    </CardTitle>
                    <CardDescription>Proteja sua conta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Alterar Senha</p>
                                <p className="text-sm text-muted-foreground">Última alteração há 30 dias</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Alterar</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Autenticação em Dois Fatores</p>
                                <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Ativar</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-lg text-destructive flex items-center gap-2">
                        <Trash2 className="h-5 w-5" />
                        Zona de Perigo
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
                        <div>
                            <p className="font-medium">Sair da Conta</p>
                            <p className="text-sm text-muted-foreground">Você será desconectado</p>
                        </div>
                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
                        <div>
                            <p className="font-medium text-destructive">Excluir Conta</p>
                            <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita</p>
                        </div>
                        <Button variant="destructive">Excluir</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
