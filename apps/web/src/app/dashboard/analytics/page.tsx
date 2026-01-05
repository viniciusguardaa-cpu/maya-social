"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    TrendingUp,
    Users,
    Heart,
    Eye,
    BarChart3,
    RefreshCw
} from "lucide-react"

export default function AnalyticsPage() {
    const { currentBrand } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">
                        Performance de {currentBrand?.name || "sua marca"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg p-1">
                        {(["7d", "30d", "90d"] as const).map((p) => (
                            <Button
                                key={p}
                                variant={period === p ? "secondary" : "ghost"}
                                size="sm"
                                className="h-8 px-3"
                                onClick={() => setPeriod(p)}
                            >
                                {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
                            </Button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Stats Cards - Empty State */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Alcance Total</p>
                                <p className="text-2xl font-bold mt-1">0</p>
                                <p className="text-sm text-muted-foreground mt-1">Sem dados ainda</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Eye className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Engajamento</p>
                                <p className="text-2xl font-bold mt-1">0</p>
                                <p className="text-sm text-muted-foreground mt-1">Sem dados ainda</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Heart className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Novos Seguidores</p>
                                <p className="text-2xl font-bold mt-1">0</p>
                                <p className="text-sm text-muted-foreground mt-1">Sem dados ainda</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Taxa de Engajamento</p>
                                <p className="text-2xl font-bold mt-1">0%</p>
                                <p className="text-sm text-muted-foreground mt-1">Sem dados ainda</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Empty State Message */}
            <Card>
                <CardContent className="p-12">
                    <div className="text-center">
                        <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum dado de analytics ainda</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Conecte suas redes sociais e publique conteúdos para começar a ver métricas de performance aqui.
                        </p>
                        <Button className="mt-6" variant="outline">
                            Conectar Redes Sociais
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
