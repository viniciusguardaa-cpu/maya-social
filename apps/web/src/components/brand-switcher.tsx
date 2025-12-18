"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, Plus, Building2 } from "lucide-react"
import { toast } from "sonner"

interface Brand {
    id: string
    name: string
    slug: string
    color?: string
}

const mockBrands: Brand[] = [
    { id: "1", name: "Maya Agency", slug: "maya", color: "#8B5CF6" },
    { id: "2", name: "TechStart", slug: "techstart", color: "#3B82F6" },
    { id: "3", name: "FoodieBox", slug: "foodiebox", color: "#F97316" },
    { id: "4", name: "FitLife", slug: "fitlife", color: "#10B981" },
]

export function BrandSwitcher() {
    const { currentBrand, setCurrentBrand } = useAuthStore()
    const [brands] = useState<Brand[]>(mockBrands)

    const activeBrand = brands.find(b => b.id === currentBrand?.id) || brands[0]

    const handleSwitch = (brand: Brand) => {
        setCurrentBrand({ id: brand.id, name: brand.name, slug: brand.slug })
        toast.success(`Trocou para ${brand.name}`)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: activeBrand.color || "#8B5CF6" }}
                        />
                        <span className="truncate max-w-[120px]">{activeBrand.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Suas Marcas
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {brands.map((brand) => (
                    <DropdownMenuItem
                        key={brand.id}
                        onClick={() => handleSwitch(brand)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: brand.color || "#8B5CF6" }}
                            />
                            <span>{brand.name}</span>
                        </div>
                        {activeBrand.id === brand.id && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Marca
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
