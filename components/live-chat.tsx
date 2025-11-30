"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, User } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

interface LiveChatProps {
  concertId: string
  initialComments?: Comment[]
}

export function LiveChat({ concertId, initialComments = [] }: LiveChatProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [lastMessageTime, setLastMessageTime] = useState<number>(0)
  const [canSendMessage, setCanSendMessage] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when new comments arrive (seulement dans le conteneur du chat, pas la page entière)
    // Utiliser scrollTop au lieu de scrollIntoView pour éviter de scroller toute la page
    if (chatEndRef.current) {
      const chatContainer = chatEndRef.current.closest('[class*="overflow"]') || chatEndRef.current.parentElement
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }
  }, [comments])

  useEffect(() => {
    // Poll for new comments every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/concerts/${concertId}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [concertId])

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSending || !canSendMessage) return

    // Anti-spam : 1 message toutes les 5 secondes
    const now = Date.now()
    const timeSinceLastMessage = now - lastMessageTime
    
    if (timeSinceLastMessage < 5000) {
      const remainingSeconds = Math.ceil((5000 - timeSinceLastMessage) / 1000)
      alert(`Veuillez attendre ${remainingSeconds} seconde${remainingSeconds > 1 ? 's' : ''} avant d'envoyer un nouveau message.`)
      return
    }

    setIsSending(true)
    setCanSendMessage(false)
    const content = newComment.trim()
    setNewComment("")
    setLastMessageTime(now)

    try {
      const response = await fetch(`/api/concerts/${concertId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [...prev, data.comment])
        
        // Réactiver l'envoi après 5 secondes
        setTimeout(() => {
          setCanSendMessage(true)
        }, 5000)
      } else {
        const errorData = await response.json()
        if (errorData.error === "RATE_LIMIT") {
          alert("Trop de messages envoyés. Veuillez patienter quelques secondes.")
        } else {
          alert(errorData.error || "Erreur lors de l&apos;envoi du message")
        }
        setNewComment(content)
        setCanSendMessage(true)
      }
    } catch (error) {
      setNewComment(content)
      setCanSendMessage(true)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="bg-[#111] border-white/10 backdrop-blur-sm" style={{ borderRadius: '14px' }}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <MessageSquare className="h-6 w-6 text-amber-500 dark:text-red-500" />
          <h3 className="text-lg font-display font-bold text-white">
            Chat Live
          </h3>
          <Badge className="ml-auto bg-green-600 text-white text-xs">
            {comments.length} message{comments.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-3">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 mb-2">Aucun message pour le moment</p>
              <p className="text-sm text-white/40">Soyez le premier à commenter !</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {comment.user.name || comment.user.email.split("@")[0]}
                    </span>
                    <span className="text-xs text-white/40">
                      {format(new Date(comment.createdAt), "HH:mm", { locale: fr })}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 break-words">{comment.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendComment} className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={canSendMessage ? "Écrivez un message..." : "Attendez quelques secondes..."}
              className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              maxLength={500}
              disabled={isSending || !canSendMessage}
            />
            <Button
              type="submit"
              disabled={!newComment.trim() || isSending}
              className="bg-amber-500 dark:bg-red-600 hover:bg-amber-600 dark:hover:bg-red-700 text-black dark:text-white"
              style={{ borderRadius: '14px' }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-white/40 mt-2">
            {newComment.length}/500 caractères
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

