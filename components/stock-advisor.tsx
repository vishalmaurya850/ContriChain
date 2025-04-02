"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Loader2, History, Clock, MessageSquare, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  preview: string
  timestamp: Date
}

export function StockAdvisor() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Stock Market Advisor. I can help you with stock market predictions, analysis, and investment advice. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const fetchChatHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch("/api/stocks/chat/history")
      if (!response.ok) {
        throw new Error("Failed to fetch chat history")
      }
      const data = await response.json()
      setChatHistory(
        data.map((session: { timestamp: string | number | Date }) => ({
          ...session,
          timestamp: new Date(session.timestamp),
        })),
      )
    } catch (error) {
      console.error("Error fetching chat history:", error)
      toast({
        title: "Error",
        description: "Failed to load chat history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }, [toast])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (activeTab === "history") {
      fetchChatHistory()
    }
  }, [activeTab, fetchChatHistory])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChatSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stocks/chat/session/${sessionId}`)
      if (!response.ok) {
        throw new Error("Failed to load chat session")
      }
      const data = await response.json()

      // Convert timestamps to Date objects
      const formattedMessages = data.messages.map((msg: { timestamp: string | number | Date }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))

      setMessages(formattedMessages)
      setCurrentSessionId(sessionId)
      setActiveTab("chat")
    } catch (error) {
      console.error("Error loading chat session:", error)
      toast({
        title: "Error",
        description: "Failed to load chat session. Please try again.",
        variant: "destructive",
      })
    }
  }

  const startNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your Stock Market Advisor. I can help you with stock market predictions, analysis, and investment advice. What would you like to know?",
        timestamp: new Date(),
      },
    ])
    setCurrentSessionId(null)
    setActiveTab("chat")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/stocks/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          sessionId: currentSessionId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ])

      // If this is a new session, update the session ID
      if (!currentSessionId && data.sessionId) {
        setCurrentSessionId(data.sessionId)
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      toast({
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarImage src="/ai-assistant.png" alt="AI" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">Stock Market Advisor</CardTitle>
              <CardDescription>Powered by AI</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={startNewChat} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            Recent History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0">
          <CardContent className="flex-grow overflow-hidden p-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                placeholder="Ask about stocks, market trends, or investment advice..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </TabsContent>

        <TabsContent value="history" className="flex-1 flex flex-col p-0">
          <CardContent className="flex-grow overflow-hidden p-4">
            <ScrollArea className="h-full pr-4">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <History className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No chat history found</p>
                  <p className="text-sm text-muted-foreground">Start a new conversation to see it here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatHistory.map((session) => (
                    <Card
                      key={session.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => loadChatSession(session.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium">{session.title}</h3>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(session.timestamp, "MMM d, h:mm a")}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{session.preview}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}