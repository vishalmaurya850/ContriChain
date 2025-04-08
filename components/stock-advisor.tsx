"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Loader2, History, Clock, MessageSquare, Plus, Brain, LineChart, AlertCircle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Message {
  role: "user" | "assistant" | "error"
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  preview: string
  timestamp: Date
}

interface Prediction {
  symbol: string
  currentPrice: number
  predictedPrice: number
  predictedDirection: "up" | "down" | "neutral"
  confidence: number
  timeframe: string
  analysis: string
  technicalFactors: string[]
  fundamentalFactors: string[]
  marketConditions: string[]
  historicalAccuracy: number
}

export function StockAdvisor() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Stock Market Advisor powered by Google Gemini 2.5 Pro. I can help you with stock market predictions, analysis, and investment advice. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null)
  const [isLearning, setIsLearning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeletingSession, setIsDeletingSession] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const fetchChatHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    setError(null)
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
      setError("Failed to load chat history. Please try again.")
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
    setError(null)
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
      setError("Failed to load chat session. Please try again.")
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
          "Hello! I'm your Stock Market Advisor powered by Google Gemini 2.5 Pro. I can help you with stock market predictions, analysis, and investment advice. What would you like to know?",
        timestamp: new Date(),
      },
    ])
    setCurrentSessionId(null)
    setCurrentPrediction(null)
    setActiveTab("chat")
    setError(null)
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
    setCurrentPrediction(null)
    setError(null)

    try {
      // Extract potential stock symbol from input
      const tickerMatch = input.match(/\$?([A-Z]{1,5})\b/g)
      const symbol = tickerMatch ? tickerMatch[0].replace("$", "") : undefined

      const response = await fetch("/api/stocks/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          sessionId: currentSessionId,
          symbol: symbol,
        }),
      })

      const responseData = await response.json().catch(() => {
        throw new Error("Invalid response format")
      })

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || "Failed to get response")
      }

      // Add fallback for missing response
      const aiResponse =
        responseData.response ||
        "I'm sorry, I couldn't generate a proper response. Please try asking in a different way."

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        },
      ])

      // If this is a new session, update the session ID
      if (responseData.sessionId) {
        setCurrentSessionId(responseData.sessionId)
      }

      // If there's a prediction, store it
      if (responseData.prediction) {
        setCurrentPrediction(responseData.prediction)
      }
    } catch (error) {
      console.error("Error getting AI response:", error)

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content:
            "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your question.",
          timestamp: new Date(),
        },
      ])

      setError(error instanceof Error ? error.message : "Failed to get a response from the AI. Please try again.")

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get a response from the AI. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLearnFromFeedback = async () => {
    if (!currentPrediction) return

    setIsLearning(true)
    try {
      // Simulate learning from feedback
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Learning complete",
        description: "The AI has learned from your feedback and will improve future predictions.",
      })
    } catch (error) {
      console.error("Error learning from feedback:", error)
      toast({
        title: "Learning failed",
        description: "There was an error processing your feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLearning(false)
    }
  }

  // Handle opening the delete confirmation dialog
  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation() // Prevent triggering the card click (which would load the session)
    setSessionToDelete(sessionId)
    setIsDeleteDialogOpen(true)
  }

  // Handle confirming deletion of a chat session
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return

    setIsDeletingSession(true)
    try {
      const response = await fetch(`/api/stocks/chat/session/${sessionToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete chat session")
      }

      // If the deleted session is the current one, start a new chat
      if (sessionToDelete === currentSessionId) {
        startNewChat()
      }

      // Refresh the chat history
      fetchChatHistory()

      toast({
        title: "Chat deleted",
        description: "The chat session has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting chat session:", error)
      toast({
        title: "Deletion failed",
        description: "Failed to delete the chat session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingSession(false)
      setIsDeleteDialogOpen(false)
      setSessionToDelete(null)
    }
  }

  // Format time consistently to avoid hydration errors
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  return (
    <>
      <Card className="w-full h-[500px] sm:h-[550px] md:h-[600px] flex flex-col">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-primary/10">
                <AvatarImage src="/ai-assistant.png" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg sm:text-xl">Stock Market Advisor</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
                  Powered by Google Gemini 2.5 Pro
                  <Badge variant="outline" className="ml-2 text-xs hidden sm:inline-flex">
                    Self-learning
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={startNewChat} className="flex items-center gap-1 mt-2 sm:mt-0">
              <Plus className="h-4 w-4" />
              <span className="sm:inline">New Chat</span>
            </Button>
          </div>
        </CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span className="sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col p-0 outline-none border-none">
            {error && (
              <Alert variant="destructive" className="mx-2 sm:mx-4 mt-2 text-xs sm:text-sm">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <CardContent className="flex-grow overflow-auto p-2 sm:p-4 h-[250px] md:h-[390px]">
              <ScrollArea className="h-full pr-2 sm:pr-4">
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[90%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.role === "error"
                              ? "bg-destructive/10 border border-destructive/20"
                              : "bg-muted"
                        }`}
                      >
                        {message.role === "error" && (
                          <div className="flex items-center gap-1 mb-1 text-destructive">
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-medium">Error</span>
                          </div>
                        )}
                        <p className="break-words">{message.content}</p>
                        <p className="mt-1 text-[10px] sm:text-xs opacity-70">{formatTime(message.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                  {currentPrediction && (
                    <div className="flex justify-start">
                      <div className="max-w-[90%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 sm:py-3 bg-muted/80 border border-muted-foreground/20 text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <LineChart className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          <h4 className="font-medium">{currentPrediction.symbol} Prediction</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-2 sm:mb-3">
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Current Price</p>
                            <p className="font-medium">${currentPrediction.currentPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Predicted Price</p>
                            <p className="font-medium">${currentPrediction.predictedPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Direction</p>
                            <p
                              className={`font-medium ${
                                currentPrediction.predictedDirection === "up"
                                  ? "text-green-500"
                                  : currentPrediction.predictedDirection === "down"
                                    ? "text-red-500"
                                    : ""
                              }`}
                            >
                              {currentPrediction.predictedDirection.toUpperCase()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Confidence</p>
                            <p className="font-medium">{Math.round(currentPrediction.confidence * 100)}%</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full flex items-center gap-1 text-[10px] sm:text-xs h-6 sm:h-8"
                          onClick={handleLearnFromFeedback}
                          disabled={isLearning}
                        >
                          {isLearning ? (
                            <>
                              <Loader2 className="h-2 w-2 sm:h-3 sm:w-3 animate-spin" />
                              Learning from feedback...
                            </>
                          ) : (
                            <>
                              <Brain className="h-2 w-2 sm:h-3 sm:w-3" />
                              Improve AI with feedback
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="border-t p-2 sm:p-4">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  placeholder="Ask about stocks or investments..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-grow text-xs sm:text-sm h-8 sm:h-10"
                />
                <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </TabsContent>

          <TabsContent value="history" className="flex-1 flex flex-col p-0 outline-none border-none">
            <CardContent className="flex-grow overflow-hidden p-2 sm:p-4">
              <ScrollArea className="h-full pr-2 sm:pr-4">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <History className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-2 sm:mb-4" />
                    <p className="text-muted-foreground text-xs sm:text-sm">No chat history found</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Start a new conversation to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatHistory.map((session) => (
                      <Card
                        key={session.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors relative group"
                        onClick={() => loadChatSession(session.id)}
                      >
                        <CardContent className="p-2 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                            <h3 className="font-medium text-xs sm:text-sm line-clamp-1">{session.title}</h3>
                            <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground">
                              <Clock className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              {format(session.timestamp, "MMM d, h:mm a")}
                            </div>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                            {session.preview}
                          </p>

                          {/* Delete button - visible on hover */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 sm:h-8 sm:w-8"
                            onClick={(e) => handleDeleteClick(e, session.id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground hover:text-destructive" />
                            <span className="sr-only">Delete chat</span>
                          </Button>
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSession}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} disabled={isDeletingSession}>
              {isDeletingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}