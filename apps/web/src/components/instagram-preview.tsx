"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"

interface InstagramPreviewProps {
    type: "FEED" | "REELS" | "STORIES" | "CAROUSEL" | string
    username?: string
    caption?: string
    hashtags?: string[]
    imageUrl?: string
}

export function InstagramPreview({
    type,
    username = "maya.agency",
    caption = "Sua legenda aqui...",
    hashtags = [],
    imageUrl
}: InstagramPreviewProps) {
    const isStory = type === "STORIES"
    const isReel = type === "REELS"

    if (isStory) {
        return (
            <div className="relative w-[200px] h-[355px] bg-gradient-to-b from-purple-500 to-pink-500 rounded-2xl overflow-hidden shadow-lg mx-auto">
                {/* Story Header */}
                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/50 to-transparent z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/30 rounded-full flex-1" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-8 w-8 ring-2 ring-white">
                            <AvatarFallback className="text-xs bg-primary">M</AvatarFallback>
                        </Avatar>
                        <span className="text-white text-xs font-medium">{username}</span>
                        <span className="text-white/60 text-xs">2h</span>
                    </div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Story" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-white/50 text-center p-4">
                            <p className="text-4xl mb-2">📱</p>
                            <p className="text-xs">Preview do Story</p>
                        </div>
                    )}
                </div>

                {/* Story Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Envie uma mensagem"
                            className="flex-1 bg-white/20 text-white text-xs rounded-full px-3 py-1.5 placeholder:text-white/50"
                            disabled
                        />
                        <Heart className="h-5 w-5 text-white" />
                        <Send className="h-5 w-5 text-white" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full max-w-[300px] bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-lg border mx-auto ${isReel ? 'aspect-[9/16]' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-pink-500 text-white">M</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold">{username}</p>
                        <p className="text-xs text-muted-foreground">Patrocinado</p>
                    </div>
                </div>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Image */}
            <div className={`bg-muted aspect-square flex items-center justify-center ${isReel ? 'aspect-[9/16]' : ''}`}>
                {imageUrl ? (
                    <img src={imageUrl} alt="Post" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-muted-foreground text-center p-4">
                        <p className="text-6xl mb-2">{isReel ? '🎬' : type === 'CAROUSEL' ? '🎠' : '📷'}</p>
                        <p className="text-xs">Preview do {type}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Heart className="h-6 w-6" />
                        <MessageCircle className="h-6 w-6" />
                        <Send className="h-6 w-6" />
                    </div>
                    <Bookmark className="h-6 w-6" />
                </div>

                <p className="text-sm font-semibold">1.234 curtidas</p>

                {/* Caption */}
                <div className="text-sm">
                    <span className="font-semibold mr-1">{username}</span>
                    <span className="text-muted-foreground">{caption}</span>
                </div>

                {/* Hashtags */}
                {hashtags.length > 0 && (
                    <p className="text-sm text-blue-500">
                        {hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}
                    </p>
                )}

                <p className="text-xs text-muted-foreground">Ver todos os 42 comentários</p>
                <p className="text-xs text-muted-foreground uppercase">Há 2 horas</p>
            </div>
        </div>
    )
}
