"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Link2,
    Plus,
    Trash2,
    GripVertical,
    ExternalLink,
    Copy,
    Eye,
    BarChart3,
    Check
} from "lucide-react"
import { toast } from "sonner"

interface BioLink {
    id: string
    title: string
    url: string
    clicks: number
    isActive: boolean
    icon?: string
}

const mockLinks: BioLink[] = [
    { id: "1", title: "Site Oficial", url: "https://maya.agency", clicks: 1234, isActive: true, icon: "🌐" },
    { id: "2", title: "WhatsApp", url: "https://wa.me/5511999999999", clicks: 892, isActive: true, icon: "💬" },
    { id: "3", title: "Portfólio", url: "https://portfolio.maya.agency", clicks: 567, isActive: true, icon: "📁" },
    { id: "4", title: "Curso Gratuito", url: "https://curso.maya.agency", clicks: 2341, isActive: true, icon: "🎓" },
    { id: "5", title: "YouTube", url: "https://youtube.com/@maya", clicks: 432, isActive: false, icon: "▶️" },
]

export function LinkInBio() {
    const [links, setLinks] = useState<BioLink[]>(mockLinks)
    const [newLink, setNewLink] = useState({ title: "", url: "" })
    const [copied, setCopied] = useState(false)

    const bioUrl = "maya.link/maya-agency"

    const addLink = () => {
        if (!newLink.title || !newLink.url) {
            toast.error("Preencha título e URL")
            return
        }

        const link: BioLink = {
            id: Date.now().toString(),
            title: newLink.title,
            url: newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`,
            clicks: 0,
            isActive: true,
            icon: "🔗"
        }

        setLinks([...links, link])
        setNewLink({ title: "", url: "" })
        toast.success("Link adicionado!")
    }

    const toggleLink = (id: string) => {
        setLinks(links.map(l =>
            l.id === id ? { ...l, isActive: !l.isActive } : l
        ))
    }

    const deleteLink = (id: string) => {
        setLinks(links.filter(l => l.id !== id))
        toast.success("Link removido")
    }

    const copyBioUrl = () => {
        navigator.clipboard.writeText(`https://${bioUrl}`)
        setCopied(true)
        toast.success("Link copiado!")
        setTimeout(() => setCopied(false), 2000)
    }

    const totalClicks = links.reduce((acc, l) => acc + l.clicks, 0)
    const activeLinks = links.filter(l => l.isActive).length

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Link2 className="h-4 w-4 text-primary" />
                        Link na Bio
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={copyBioUrl}>
                        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copied ? "Copiado!" : bioUrl}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{activeLinks}</p>
                        <p className="text-xs text-muted-foreground">Links Ativos</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{totalClicks.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Cliques Total</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-bold">{links.length}</p>
                        <p className="text-xs text-muted-foreground">Total Links</p>
                    </div>
                </div>

                {/* Add New Link */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Título"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                        className="flex-1"
                    />
                    <Input
                        placeholder="URL"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        className="flex-1"
                    />
                    <Button size="icon" onClick={addLink}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Links List */}
                <div className="space-y-2">
                    {links.map((link, index) => (
                        <div
                            key={link.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-opacity ${link.isActive ? "" : "opacity-50"
                                }`}
                        >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <span className="text-lg">{link.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{link.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <BarChart3 className="h-3 w-3" />
                                {link.clicks.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => window.open(link.url, "_blank")}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => toggleLink(link.id)}
                                >
                                    <Eye className={`h-4 w-4 ${link.isActive ? "" : "text-muted-foreground"}`} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => deleteLink(link.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar Página
                </Button>
            </CardContent>
        </Card>
    )
}
