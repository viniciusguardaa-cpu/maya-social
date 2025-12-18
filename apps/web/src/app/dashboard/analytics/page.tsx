"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts"
import {
    TrendingUp,
    TrendingDown,
    Users,
    Heart,
    Eye,
    MessageCircle,
    Share2,
    Calendar,
    RefreshCw,
    Download,
    FileSpreadsheet
} from "lucide-react"
import { toast } from "sonner"

const engagementData = [
    { name: "Seg", likes: 1200, comments: 340, shares: 120 },
    { name: "Ter", likes: 1800, comments: 420, shares: 180 },
    { name: "Qua", likes: 1400, comments: 380, shares: 140 },
    { name: "Qui", likes: 2200, comments: 520, shares: 240 },
    { name: "Sex", likes: 1900, comments: 460, shares: 200 },
    { name: "Sáb", likes: 2800, comments: 680, shares: 320 },
    { name: "Dom", likes: 2400, comments: 580, shares: 280 },
]

const reachData = [
    { name: "Sem 1", reach: 12400, impressions: 18600 },
    { name: "Sem 2", reach: 15800, impressions: 23700 },
    { name: "Sem 3", reach: 14200, impressions: 21300 },
    { name: "Sem 4", reach: 18900, impressions: 28350 },
]

const contentTypeData = [
    { name: "Feed", value: 35, color: "#ec4899" },
    { name: "Reels", value: 40, color: "#8b5cf6" },
    { name: "Stories", value: 15, color: "#3b82f6" },
    { name: "Carousel", value: 10, color: "#f97316" },
]

const bestTimesData = [
    { hour: "08h", engagement: 45 },
    { hour: "09h", engagement: 52 },
    { hour: "10h", engagement: 78 },
    { hour: "11h", engagement: 65 },
    { hour: "12h", engagement: 88 },
    { hour: "13h", engagement: 72 },
    { hour: "14h", engagement: 58 },
    { hour: "15h", engagement: 62 },
    { hour: "16h", engagement: 70 },
    { hour: "17h", engagement: 82 },
    { hour: "18h", engagement: 95 },
    { hour: "19h", engagement: 90 },
    { hour: "20h", engagement: 75 },
    { hour: "21h", engagement: 60 },
]

interface StatCardProps {
    title: string
    value: string
    change: number
    icon: React.ReactNode
}

function StatCard({ title, value, change, icon }: StatCardProps) {
    const isPositive = change >= 0
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        <div className={`flex items-center gap-1 mt-1 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            <span>{isPositive ? "+" : ""}{change}%</span>
                            <span className="text-muted-foreground">vs mês anterior</span>
                        </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AnalyticsPage() {
    const { currentBrand } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
        if (data.length === 0) return

        const headers = Object.keys(data[0])
        const csvContent = [
            headers.join(","),
            ...data.map(row => headers.map(h => row[h]).join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
        toast.success(`${filename}.csv exportado!`)
    }

    const exportAllData = () => {
        const allData = {
            engajamento: engagementData,
            alcance: reachData,
            horarios: bestTimesData,
        }

        const jsonStr = JSON.stringify(allData, null, 2)
        const blob = new Blob([jsonStr], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `analytics_completo_${new Date().toISOString().split("T")[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
        toast.success("Relatório completo exportado!")
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
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
                        Performance de {currentBrand?.name || "Maya Brand"}
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
                    <Button variant="outline" size="sm" onClick={() => exportToCSV(engagementData, "engajamento")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        CSV
                    </Button>
                    <Button size="sm" onClick={exportAllData}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Alcance Total"
                    value="61.3K"
                    change={12.5}
                    icon={<Eye className="h-6 w-6" />}
                />
                <StatCard
                    title="Engajamento"
                    value="8.4K"
                    change={8.2}
                    icon={<Heart className="h-6 w-6" />}
                />
                <StatCard
                    title="Novos Seguidores"
                    value="+847"
                    change={-3.1}
                    icon={<Users className="h-6 w-6" />}
                />
                <StatCard
                    title="Taxa de Engajamento"
                    value="4.2%"
                    change={15.3}
                    icon={<TrendingUp className="h-6 w-6" />}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Engagement Over Time */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Engajamento por Dia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={engagementData}>
                                <defs>
                                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="name" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="likes" name="Curtidas" stroke="#ec4899" fillOpacity={1} fill="url(#colorLikes)" />
                                <Area type="monotone" dataKey="comments" name="Comentários" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorComments)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Reach & Impressions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Alcance e Impressões</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reachData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="name" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="reach" name="Alcance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="impressions" name="Impressões" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Content Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Distribuição por Tipo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={contentTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {contentTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                            {contentTypeData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm">{item.name} ({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Best Times to Post */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Melhores Horários para Postar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={bestTimesData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="hour" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="engagement" fill="#10b981" radius={[4, 4, 0, 0]}>
                                    {bestTimesData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.engagement >= 85 ? "#10b981" : entry.engagement >= 70 ? "#22c55e" : "#6ee7b7"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Posts */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Top Conteúdos do Período</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { code: "MAYA_RL_12", type: "REELS", title: "Trend Viral", likes: 2847, comments: 342, shares: 189, reach: 18420 },
                            { code: "MAYA_CA_05", type: "CAROUSEL", title: "Tutorial Completo", likes: 1923, comments: 278, shares: 145, reach: 12350 },
                            { code: "MAYA_FD_08", type: "FEED", title: "Lançamento Produto", likes: 1654, comments: 198, shares: 87, reach: 9870 },
                        ].map((post, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                                <div className="text-2xl font-bold text-muted-foreground w-8">#{i + 1}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium">{post.title}</p>
                                    <p className="text-sm text-muted-foreground font-mono">{post.code}</p>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Heart className="h-4 w-4 text-pink-500" />
                                        <span>{post.likes.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="h-4 w-4 text-blue-500" />
                                        <span>{post.comments}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Share2 className="h-4 w-4 text-green-500" />
                                        <span>{post.shares}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-4 w-4 text-purple-500" />
                                        <span>{post.reach.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card >
        </div >
    )
}
