"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

interface UpcomingPost {
    id: string
    code: string
    title: string
    type: string
    scheduledAt: string
}

const typeLabels: Record<string, string> = {
    FEED: "Feed",
    REELS: "Reels",
    STORIES: "Stories",
    CAROUSEL: "Carrossel",
    AD: "Anúncio",
}

interface UpcomingPostsProps {
    posts: UpcomingPost[]
}

export function UpcomingPosts({ posts }: UpcomingPostsProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Próximas Publicações</CardTitle>
                <Link href="/dashboard/calendar">
                    <Button variant="ghost" size="sm">
                        Ver calendário
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {posts.map((post) => {
                        const date = new Date(post.scheduledAt)
                        return (
                            <div
                                key={post.id}
                                className="flex items-center gap-4 rounded-lg border p-3"
                            >
                                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <span className="text-xs font-medium">
                                        {format(date, "MMM", { locale: ptBR }).toUpperCase()}
                                    </span>
                                    <span className="text-lg font-bold">{format(date, "dd")}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{post.title || post.code}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {format(date, "HH:mm")}
                                        <Badge variant="outline" className="ml-2">
                                            {typeLabels[post.type] || post.type}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {posts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <Calendar className="h-10 w-10 text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Nenhuma publicação agendada
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
