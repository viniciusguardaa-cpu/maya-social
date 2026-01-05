"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Hash,
    Plus,
    Copy,
    Trash2,
    Edit,
    Search,
    Star,
    Check,
    Sparkles
} from "lucide-react"
import { toast } from "sonner"

interface HashtagGroup {
    id: string
    name: string
    hashtags: string[]
    category: string
    isFavorite: boolean
    usageCount: number
}

const mockGroups: HashtagGroup[] = []

const categories = ["Todos", "Marketing", "Business", "Crescimento", "Lifestyle", "Formato"]

export default function HashtagsPage() {
    const [groups, setGroups] = useState<HashtagGroup[]>(mockGroups)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("Todos")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newGroup, setNewGroup] = useState({ name: "", hashtags: "", category: "Marketing" })
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const filteredGroups = groups.filter(group => {
        const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.hashtags.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesCategory = selectedCategory === "Todos" || group.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const copyHashtags = (group: HashtagGroup) => {
        const text = group.hashtags.map(h => `#${h}`).join(" ")
        navigator.clipboard.writeText(text)
        setCopiedId(group.id)
        toast.success(`${group.hashtags.length} hashtags copiadas!`)
        setTimeout(() => setCopiedId(null), 2000)

        setGroups(groups.map(g =>
            g.id === group.id ? { ...g, usageCount: g.usageCount + 1 } : g
        ))
    }

    const toggleFavorite = (id: string) => {
        setGroups(groups.map(g =>
            g.id === id ? { ...g, isFavorite: !g.isFavorite } : g
        ))
    }

    const deleteGroup = (id: string) => {
        setGroups(groups.filter(g => g.id !== id))
        toast.success("Grupo excluído")
    }

    const createGroup = () => {
        if (!newGroup.name || !newGroup.hashtags) return

        const hashtags = newGroup.hashtags
            .split(/[,\s#]+/)
            .filter(h => h.trim())
            .map(h => h.trim().toLowerCase())

        const group: HashtagGroup = {
            id: Date.now().toString(),
            name: newGroup.name,
            hashtags,
            category: newGroup.category,
            isFavorite: false,
            usageCount: 0
        }

        setGroups([group, ...groups])
        setNewGroup({ name: "", hashtags: "", category: "Marketing" })
        setIsCreateOpen(false)
        toast.success("Grupo criado com sucesso!")
    }

    const totalHashtags = groups.reduce((acc, g) => acc + g.hashtags.length, 0)
    const favoriteGroups = groups.filter(g => g.isFavorite).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Hash className="h-6 w-6" />
                        Biblioteca de Hashtags
                    </h1>
                    <p className="text-muted-foreground">
                        {groups.length} grupos • {totalHashtags} hashtags
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Grupo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Grupo de Hashtags</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome do Grupo</Label>
                                <Input
                                    placeholder="Ex: Marketing Digital"
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border bg-background"
                                    value={newGroup.category}
                                    onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                                >
                                    {categories.filter(c => c !== "Todos").map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Hashtags (separadas por vírgula ou espaço)</Label>
                                <Textarea
                                    placeholder="#marketing, #digital, #socialmedia..."
                                    value={newGroup.hashtags}
                                    onChange={(e) => setNewGroup({ ...newGroup, hashtags: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <Button onClick={createGroup} className="w-full">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Criar Grupo
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Hash className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{totalHashtags}</p>
                            <p className="text-xs text-muted-foreground">Hashtags</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Star className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{favoriteGroups}</p>
                            <p className="text-xs text-muted-foreground">Favoritos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Copy className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{groups.reduce((a, g) => a + g.usageCount, 0)}</p>
                            <p className="text-xs text-muted-foreground">Usos</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar hashtags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Groups Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map((group) => (
                    <Card key={group.id} className="group">
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        {group.name}
                                        {group.isFavorite && (
                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        )}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {group.category} • {group.hashtags.length} tags • {group.usageCount} usos
                                    </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => toggleFavorite(group.id)}
                                    >
                                        <Star className={`h-4 w-4 ${group.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive"
                                        onClick={() => deleteGroup(group.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex flex-wrap gap-1">
                                {group.hashtags.slice(0, 6).map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                        #{tag}
                                    </Badge>
                                ))}
                                {group.hashtags.length > 6 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{group.hashtags.length - 6}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => copyHashtags(group)}
                            >
                                {copiedId === group.id ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copiar Todas
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredGroups.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Hash className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">Nenhum grupo encontrado</p>
                        <p className="text-sm text-muted-foreground">Crie seu primeiro grupo de hashtags!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
