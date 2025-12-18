"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    TrendingUp,
    TrendingDown,
    Minus,
    BarChart3,
    Heart,
    MessageCircle,
    Share2,
    Eye
} from "lucide-react"

interface MetricComparison {
    name: string
    icon: React.ReactNode
    current: number
    previous: number
    unit: string
}

const mockMetrics: MetricComparison[] = [
    { name: "Alcance", icon: <Eye className="h-4 w-4" />, current: 45200, previous: 38500, unit: "" },
    { name: "Engajamento", icon: <Heart className="h-4 w-4" />, current: 3420, previous: 2890, unit: "" },
    { name: "Comentários", icon: <MessageCircle className="h-4 w-4" />, current: 892, previous: 1024, unit: "" },
    { name: "Compartilhamentos", icon: <Share2 className="h-4 w-4" />, current: 234, previous: 189, unit: "" },
]

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
}

export function PerformanceComparison() {
    const getChange = (current: number, previous: number) => {
        const change = ((current - previous) / previous) * 100
        return {
            value: Math.abs(change).toFixed(1),
            isPositive: change > 0,
            isNeutral: change === 0
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Performance vs. Período Anterior
                    </CardTitle>
                    <Badge variant="outline">Últimos 7 dias</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockMetrics.map((metric, i) => {
                    const change = getChange(metric.current, metric.previous)
                    const progressValue = (metric.current / (metric.current + metric.previous)) * 100

                    return (
                        <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="text-muted-foreground">{metric.icon}</div>
                                    <span className="text-sm font-medium">{metric.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">
                                        {formatNumber(metric.current)}
                                    </span>
                                    <Badge
                                        variant={change.isPositive ? "default" : "destructive"}
                                        className="text-xs"
                                    >
                                        {change.isPositive ? (
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 mr-1" />
                                        )}
                                        {change.value}%
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Progress value={progressValue} className="h-2 flex-1" />
                                <span className="text-xs text-muted-foreground w-16 text-right">
                                    vs {formatNumber(metric.previous)}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
