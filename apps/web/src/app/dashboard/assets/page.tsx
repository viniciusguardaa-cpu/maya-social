"use client"

import { useState, useRef } from "react"
import { useAuthStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Upload,
    Image as ImageIcon,
    Video,
    FileText,
    Search,
    Grid3X3,
    List,
    Filter,
    Download,
    Trash2,
    Eye,
    Copy,
    MoreVertical,
    FolderOpen,
    X,
    Check,
    Play
} from "lucide-react"

interface Asset {
    id: string
    name: string
    type: "image" | "video" | "document"
    url: string
    thumbnail?: string
    size: string
    dimensions?: string
    createdAt: string
    tags: string[]
}

const mockAssets: Asset[] = []

type ViewMode = "grid" | "list"
type FilterType = "all" | "image" | "video"

export default function AssetsPage() {
    const { currentBrand } = useAuthStore()
    const [assets, setAssets] = useState<Asset[]>(mockAssets)
    const [viewMode, setViewMode] = useState<ViewMode>("grid")
    const [filterType, setFilterType] = useState<FilterType>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [previewOpen, setPreviewOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const filteredAssets = assets.filter(asset => {
        const matchesType = filterType === "all" || asset.type === filterType
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesType && matchesSearch
    })

    const handleUpload = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        Array.from(files).forEach(file => {
            const newAsset: Asset = {
                id: Date.now().toString() + Math.random(),
                name: file.name,
                type: file.type.startsWith("video") ? "video" : "image",
                url: URL.createObjectURL(file),
                size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                createdAt: new Date().toISOString().split("T")[0],
                tags: [],
            }
            setAssets(prev => [newAsset, ...prev])
        })
    }

    const handleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleDelete = (ids: string[]) => {
        if (!confirm(`Excluir ${ids.length} arquivo(s)?`)) return
        setAssets(prev => prev.filter(a => !ids.includes(a.id)))
        setSelectedIds([])
    }

    const openPreview = (asset: Asset) => {
        setSelectedAsset(asset)
        setPreviewOpen(true)
    }

    const stats = {
        total: assets.length,
        images: assets.filter(a => a.type === "image").length,
        videos: assets.filter(a => a.type === "video").length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Assets</h1>
                    <p className="text-muted-foreground">
                        {stats.total} arquivos • {stats.images} imagens • {stats.videos} vídeos
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button onClick={handleUpload}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={(v: FilterType) => setFilterType(v)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="image">Imagens</SelectItem>
                            <SelectItem value="video">Vídeos</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center border rounded-lg p-1">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>

                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(selectedIds)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir ({selectedIds.length})
                        </Button>
                    )}
                </div>
            </div>

            {/* Assets Grid/List */}
            {filteredAssets.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">Nenhum asset encontrado</p>
                        <p className="text-sm text-muted-foreground mb-4">
                            Faça upload de imagens e vídeos para usar nos conteúdos
                        </p>
                        <Button onClick={handleUpload}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload de Arquivos
                        </Button>
                    </CardContent>
                </Card>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredAssets.map((asset) => (
                        <div
                            key={asset.id}
                            className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${selectedIds.includes(asset.id)
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-transparent hover:border-muted"
                                }`}
                            onClick={() => openPreview(asset)}
                        >
                            <img
                                src={asset.thumbnail || asset.url}
                                alt={asset.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Type Badge */}
                            {asset.type === "video" && (
                                <div className="absolute top-2 left-2">
                                    <div className="bg-black/60 rounded-full p-1.5">
                                        <Play className="h-3 w-3 text-white fill-white" />
                                    </div>
                                </div>
                            )}

                            {/* Select Checkbox */}
                            <div
                                className={`absolute top-2 right-2 transition-opacity ${selectedIds.includes(asset.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    }`}
                                onClick={(e) => { e.stopPropagation(); handleSelect(asset.id) }}
                            >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedIds.includes(asset.id)
                                        ? "bg-primary border-primary"
                                        : "bg-white/80 border-gray-300"
                                    }`}>
                                    {selectedIds.includes(asset.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                    )}
                                </div>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                                <div className="p-2 w-full">
                                    <p className="text-white text-xs truncate">{asset.name}</p>
                                    <p className="text-white/70 text-[10px]">{asset.size}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {filteredAssets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer ${selectedIds.includes(asset.id) ? "bg-primary/5" : ""
                                        }`}
                                    onClick={() => openPreview(asset)}
                                >
                                    <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${selectedIds.includes(asset.id)
                                                ? "bg-primary border-primary"
                                                : "border-gray-300"
                                            }`}
                                        onClick={(e) => { e.stopPropagation(); handleSelect(asset.id) }}
                                    >
                                        {selectedIds.includes(asset.id) && (
                                            <Check className="h-3 w-3 text-white" />
                                        )}
                                    </div>

                                    <div className="w-12 h-12 rounded overflow-hidden shrink-0">
                                        <img
                                            src={asset.thumbnail || asset.url}
                                            alt={asset.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{asset.name}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {asset.type === "image" ? (
                                                <ImageIcon className="h-3 w-3" />
                                            ) : (
                                                <Video className="h-3 w-3" />
                                            )}
                                            <span>{asset.size}</span>
                                            {asset.dimensions && <span>• {asset.dimensions}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {asset.tags.slice(0, 2).map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    <span className="text-sm text-muted-foreground">{asset.createdAt}</span>

                                    <Button variant="ghost" size="icon" className="shrink-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedAsset?.type === "image" ? (
                                <ImageIcon className="h-5 w-5" />
                            ) : (
                                <Video className="h-5 w-5" />
                            )}
                            {selectedAsset?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedAsset && (
                        <div className="space-y-4">
                            <div className="relative aspect-square max-h-[60vh] mx-auto overflow-hidden rounded-lg bg-muted">
                                <img
                                    src={selectedAsset.url}
                                    alt={selectedAsset.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{selectedAsset.size}</span>
                                    {selectedAsset.dimensions && <span>{selectedAsset.dimensions}</span>}
                                    <span>{selectedAsset.createdAt}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copiar URL
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            handleDelete([selectedAsset.id])
                                            setPreviewOpen(false)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir
                                    </Button>
                                </div>
                            </div>

                            {selectedAsset.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Tags:</span>
                                    {selectedAsset.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
