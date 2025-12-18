"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
    Building2,
    Palette,
    Instagram,
    Globe,
    Save,
    Loader2,
    CheckCircle,
    Link2,
    Hash,
    FileText,
    Target,
    Users,
    Sparkles
} from "lucide-react"

interface BrandSettings {
    name: string
    slug: string
    description: string
    website: string
    instagram: string
    primaryColor: string
    secondaryColor: string
    tone: string
    targetAudience: string
    hashtags: string
    bio: string
}

export default function BrandPage() {
    const { currentBrand, setCurrentBrand } = useAuthStore()
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Load saved brand settings from localStorage
    const getSavedSettings = (): BrandSettings => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`brand-settings-${currentBrand?.id}`)
            if (saved) return JSON.parse(saved)
        }
        return {
            name: currentBrand?.name || "Minha Marca",
            slug: currentBrand?.slug || "minha-marca",
            description: "",
            website: "",
            instagram: "",
            primaryColor: "#8B5CF6",
            secondaryColor: "#EC4899",
            tone: "",
            targetAudience: "",
            hashtags: "",
            bio: "",
        }
    }

    const [settings, setSettings] = useState<BrandSettings>(getSavedSettings)

    const handleSave = async () => {
        setSaving(true)

        // Save to localStorage
        if (typeof window !== 'undefined' && currentBrand?.id) {
            localStorage.setItem(`brand-settings-${currentBrand.id}`, JSON.stringify(settings))
        }

        // Update brand name in store
        if (currentBrand && settings.name !== currentBrand.name) {
            setCurrentBrand({
                ...currentBrand,
                name: settings.name,
                slug: settings.slug,
            })
        }

        await new Promise(r => setTimeout(r, 500))
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const updateField = (field: keyof BrandSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Configurações da Marca</h1>
                    <p className="text-muted-foreground">
                        Configure as informações e identidade visual da sua marca
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

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Informações Básicas
                    </CardTitle>
                    <CardDescription>Nome, slug e descrição da marca</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome da Marca</Label>
                            <Input
                                value={settings.name}
                                onChange={(e) => updateField("name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug (URL)</Label>
                            <Input
                                value={settings.slug}
                                onChange={(e) => updateField("slug", e.target.value)}
                                className="font-mono"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea
                            value={settings.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            rows={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Links e Redes Sociais
                    </CardTitle>
                    <CardDescription>Website e perfis nas redes sociais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Globe className="h-4 w-4" /> Website
                            </Label>
                            <Input
                                value={settings.website}
                                onChange={(e) => updateField("website", e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Instagram className="h-4 w-4" /> Instagram
                            </Label>
                            <Input
                                value={settings.instagram}
                                onChange={(e) => updateField("instagram", e.target.value)}
                                placeholder="@usuario"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Colors */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Identidade Visual
                    </CardTitle>
                    <CardDescription>Cores da marca para uso nos conteúdos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cor Primária</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={settings.primaryColor}
                                    onChange={(e) => updateField("primaryColor", e.target.value)}
                                    className="w-12 h-10 rounded border cursor-pointer"
                                />
                                <Input
                                    value={settings.primaryColor}
                                    onChange={(e) => updateField("primaryColor", e.target.value)}
                                    className="font-mono flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Cor Secundária</Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={settings.secondaryColor}
                                    onChange={(e) => updateField("secondaryColor", e.target.value)}
                                    className="w-12 h-10 rounded border cursor-pointer"
                                />
                                <Input
                                    value={settings.secondaryColor}
                                    onChange={(e) => updateField("secondaryColor", e.target.value)}
                                    className="font-mono flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 h-20 rounded-lg" style={{ backgroundColor: settings.primaryColor }} />
                        <div className="flex-1 h-20 rounded-lg" style={{ backgroundColor: settings.secondaryColor }} />
                    </div>
                </CardContent>
            </Card>

            {/* Voice & Tone */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Tom de Voz
                    </CardTitle>
                    <CardDescription>
                        Define como a IA deve escrever os conteúdos
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Descrição do Tom</Label>
                        <Textarea
                            value={settings.tone}
                            onChange={(e) => updateField("tone", e.target.value)}
                            rows={3}
                            placeholder="Descreva como a marca deve se comunicar..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Público-Alvo
                    </CardTitle>
                    <CardDescription>
                        Quem são as pessoas que você quer alcançar
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Descrição do Público</Label>
                        <Textarea
                            value={settings.targetAudience}
                            onChange={(e) => updateField("targetAudience", e.target.value)}
                            rows={2}
                            placeholder="Descreva seu público-alvo..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Hashtags & Bio */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Hash className="h-5 w-5" />
                        Hashtags e Bio
                    </CardTitle>
                    <CardDescription>
                        Hashtags padrão e bio do perfil
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Hashtags Padrão</Label>
                        <Textarea
                            value={settings.hashtags}
                            onChange={(e) => updateField("hashtags", e.target.value)}
                            rows={2}
                            placeholder="#suamarca #hashtag..."
                        />
                        <p className="text-xs text-muted-foreground">
                            Essas hashtags serão sugeridas ao gerar briefs
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>Bio do Instagram</Label>
                        <Textarea
                            value={settings.bio}
                            onChange={(e) => updateField("bio", e.target.value)}
                            rows={4}
                            placeholder="Sua bio..."
                        />
                        <p className="text-xs text-muted-foreground">
                            {settings.bio.length}/150 caracteres
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Integration Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Instagram className="h-5 w-5" />
                        Integrações
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                                <Instagram className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium">Instagram Business</p>
                                <p className="text-sm text-muted-foreground">Conecte para publicar diretamente</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Não conectado
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
