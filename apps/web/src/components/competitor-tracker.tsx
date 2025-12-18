"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    Users,
    Plus,
    TrendingUp,
    TrendingDown,
    Eye,
    Heart,
    Trash2,
    ExternalLink
} from "lucide-react"
import { toast } from "sonner"

interface Competitor {
    id: string
    name: string
    handle: string
    followers: number
    followersGrowth: number
    avgEngagement: number
    postsPerWeek: number
    color: string
}

const mockCompetitors: Competitor[] = [
    { id: "1", name: "Concorrente A", handle: "@concorrente_a", followers: 125000, followersGrowth: 2.3, avgEngagement: 4.2, postsPerWeek: 5, color: "#3B82F6" },
    { id: "2", name: "Concorrente B", handle: "@concorrente_b", followers: 89000, followersGrowth: -0.5, avgEngagement: 3.8, postsPerWeek: 7, color: "#10B981" },
    { id: "3", name: "Concorrente C", handle: "@concorrente_c", followers: 210000, followersGrowth: 1.8, avgEngagement: 5.1, postsPerWeek: 4, color: "#F59E0B" },
]

const myStats = {
    followers: 45000,
    followersGrowth: 3.5,
    avgEngagement: 4.8,
    postsPerWeek: 6
}

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
}

export function CompetitorTracker() {
    const [competitors, setCompetitors] = useState<Competitor[]>(mockCompetitors)
    const [newHandle, setNewHandle] = useState("")

    const addCompetitor = () => {
        if (!newHandle) return

        const competitor: Competitor = {
            id: Date.now().toString(),
            name: newHandle.replace("@", ""),
            handle: newHandle.startsWith("@") ? newHandle : `@${newHandle}`,
            followers: Math.floor(Math.random() * 100000) + 10000,
            followersGrowth: (Math.random() * 5 - 1).toFixed(1) as unknown as number,
            avgEngagement: (Math.random() * 5 + 2).toFixed(1) as unknown as number,
            postsPerWeek: Math.floor(Math.random() * 7) + 2,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        }

        setCompetitors([...competitors, competitor])
        setNewHandle("")
        toast.success("Concorrente adicionado!")
    }

    const removeCompetitor = (id: string) => {
        setCompetitors(competitors.filter(c => c.id !== id))
        toast.success("Concorrente removido")
    }

    const maxFollowers = Math.max(...competitors.map(c => c.followers), myStats.followers)

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-primary" />
                    Análise de Concorrentes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Competitor */}
                <div className="flex gap-2">
                    <Input
                        placeholder="@handle do concorrente"
                        value={newHandle}
                        onChange={(e) => setNewHandle(e.target.value)}
                        className="flex-1"
                    />
                    <Button size="sm" onClick={addCompetitor}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* My Stats */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8 ring-2 ring-primary">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">EU</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-medium text-sm">Minha Conta</p>
                            <p className="text-xs text-muted-foreground">@maya.agency</p>
                        </div>
                        <Badge variant="default">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{myStats.followersGrowth}%
                        </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-lg font-bold">{formatNumber(myStats.followers)}</p>
                            <p className="text-xs text-muted-foreground">Seguidores</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold">{myStats.avgEngagement}%</p>
                            <p className="text-xs text-muted-foreground">Engajamento</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold">{myStats.postsPerWeek}</p>
                            <p className="text-xs text-muted-foreground">Posts/sem</p>
                        </div>
                    </div>
                    <Progress value={(myStats.followers / maxFollowers) * 100} className="h-2 mt-2" />
                </div>

                {/* Competitors */}
                <div className="space-y-2">
                    {competitors.map((competitor) => (
                        <div key={competitor.id} className="p-3 rounded-lg border">
                            <div className="flex items-center gap-3 mb-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback
                                        className="text-xs text-white"
                                        style={{ backgroundColor: competitor.color }}
                                    >
                                        {competitor.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{competitor.name}</p>
                                    <p className="text-xs text-muted-foreground">{competitor.handle}</p>
                                </div>
                                <Badge variant={competitor.followersGrowth >= 0 ? "secondary" : "destructive"}>
                                    {competitor.followersGrowth >= 0 ? (
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                    )}
                                    {competitor.followersGrowth >= 0 ? "+" : ""}{competitor.followersGrowth}%
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => removeCompetitor(competitor.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                <div>
                                    <p className="font-medium">{formatNumber(competitor.followers)}</p>
                                    <p className="text-xs text-muted-foreground">Seguidores</p>
                                </div>
                                <div>
                                    <p className="font-medium">{competitor.avgEngagement}%</p>
                                    <p className="text-xs text-muted-foreground">Engajamento</p>
                                </div>
                                <div>
                                    <p className="font-medium">{competitor.postsPerWeek}</p>
                                    <p className="text-xs text-muted-foreground">Posts/sem</p>
                                </div>
                            </div>
                            <Progress
                                value={(competitor.followers / maxFollowers) * 100}
                                className="h-2 mt-2"
                                style={{ "--progress-color": competitor.color } as React.CSSProperties}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
