"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Crop,
    SunMedium,
    Contrast,
    Droplets,
    RotateCcw,
    Download,
    Check,
    X,
    Square,
    RectangleVertical,
    RectangleHorizontal,
    Circle
} from "lucide-react"
import { toast } from "sonner"

interface ImageEditorProps {
    imageUrl: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave?: (editedImageUrl: string) => void
}

const filters = [
    { id: "normal", name: "Normal", style: {} },
    { id: "grayscale", name: "P&B", style: { filter: "grayscale(100%)" } },
    { id: "sepia", name: "Sépia", style: { filter: "sepia(80%)" } },
    { id: "vintage", name: "Vintage", style: { filter: "sepia(30%) contrast(110%) brightness(90%)" } },
    { id: "cold", name: "Frio", style: { filter: "saturate(80%) hue-rotate(180deg)" } },
    { id: "warm", name: "Quente", style: { filter: "saturate(120%) hue-rotate(-10deg)" } },
    { id: "dramatic", name: "Drama", style: { filter: "contrast(130%) saturate(130%)" } },
    { id: "fade", name: "Fade", style: { filter: "contrast(90%) brightness(110%) saturate(80%)" } },
]

const aspectRatios = [
    { id: "free", name: "Livre", icon: <Crop className="h-4 w-4" />, ratio: null },
    { id: "1:1", name: "1:1", icon: <Square className="h-4 w-4" />, ratio: 1 },
    { id: "4:5", name: "4:5", icon: <RectangleVertical className="h-4 w-4" />, ratio: 4 / 5 },
    { id: "9:16", name: "9:16", icon: <RectangleVertical className="h-4 w-4" />, ratio: 9 / 16 },
    { id: "16:9", name: "16:9", icon: <RectangleHorizontal className="h-4 w-4" />, ratio: 16 / 9 },
]

export function ImageEditor({ imageUrl, open, onOpenChange, onSave }: ImageEditorProps) {
    const [selectedFilter, setSelectedFilter] = useState("normal")
    const [brightness, setBrightness] = useState(100)
    const [contrast, setContrast] = useState(100)
    const [saturation, setSaturation] = useState(100)
    const [selectedRatio, setSelectedRatio] = useState("free")

    const resetAdjustments = () => {
        setBrightness(100)
        setContrast(100)
        setSaturation(100)
        setSelectedFilter("normal")
        toast.info("Ajustes resetados")
    }

    const handleSave = () => {
        onSave?.(imageUrl)
        onOpenChange(false)
        toast.success("Imagem salva!")
    }

    const getFilterStyle = () => {
        const filter = filters.find(f => f.id === selectedFilter)
        const baseFilter = filter?.style.filter || ""
        const adjustments = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

        return {
            filter: baseFilter ? `${baseFilter} ${adjustments}` : adjustments
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Crop className="h-5 w-5" />
                        Editor de Imagem
                    </DialogTitle>
                </DialogHeader>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Preview */}
                    <div className="lg:col-span-2">
                        <div className="relative bg-muted rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="max-w-full max-h-[400px] object-contain transition-all"
                                    style={getFilterStyle()}
                                />
                            ) : (
                                <div className="text-center text-muted-foreground p-8">
                                    <Crop className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p>Nenhuma imagem selecionada</p>
                                </div>
                            )}
                        </div>

                        {/* Aspect Ratio */}
                        <div className="flex justify-center gap-2 mt-4">
                            {aspectRatios.map((ratio) => (
                                <Button
                                    key={ratio.id}
                                    variant={selectedRatio === ratio.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedRatio(ratio.id)}
                                    className="gap-1"
                                >
                                    {ratio.icon}
                                    <span className="text-xs">{ratio.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Filtros</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {filters.map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setSelectedFilter(filter.id)}
                                        className={`p-2 rounded-lg border text-center transition-all ${selectedFilter === filter.id
                                                ? "border-primary bg-primary/10"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <div
                                            className="w-full h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded mb-1"
                                            style={filter.style}
                                        />
                                        <span className="text-xs">{filter.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Adjustments */}
                        <div className="space-y-4">
                            <Label className="text-sm font-medium">Ajustes</Label>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs flex items-center gap-1">
                                            <SunMedium className="h-3 w-3" />
                                            Brilho
                                        </Label>
                                        <span className="text-xs text-muted-foreground">{brightness}%</span>
                                    </div>
                                    <Slider
                                        value={[brightness]}
                                        onValueChange={([v]) => setBrightness(v)}
                                        min={50}
                                        max={150}
                                        step={1}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs flex items-center gap-1">
                                            <Contrast className="h-3 w-3" />
                                            Contraste
                                        </Label>
                                        <span className="text-xs text-muted-foreground">{contrast}%</span>
                                    </div>
                                    <Slider
                                        value={[contrast]}
                                        onValueChange={([v]) => setContrast(v)}
                                        min={50}
                                        max={150}
                                        step={1}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs flex items-center gap-1">
                                            <Droplets className="h-3 w-3" />
                                            Saturação
                                        </Label>
                                        <span className="text-xs text-muted-foreground">{saturation}%</span>
                                    </div>
                                    <Slider
                                        value={[saturation]}
                                        onValueChange={([v]) => setSaturation(v)}
                                        min={0}
                                        max={200}
                                        step={1}
                                    />
                                </div>
                            </div>

                            <Button variant="outline" size="sm" className="w-full" onClick={resetAdjustments}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Resetar
                            </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button className="flex-1" onClick={handleSave}>
                                <Check className="h-4 w-4 mr-2" />
                                Aplicar
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
