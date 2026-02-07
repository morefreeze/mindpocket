"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Sparkles } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import { ChatInput } from "@/components/chat-input"
import { ChatMessages } from "@/components/chat-messages"

const transport = new DefaultChatTransport({
  api: "/api/chat",
})

export function Chat({ id, initialMessages = [] }: { id: string; initialMessages?: UIMessage[] }) {
  const [input, setInput] = useState("")
  const hasReplacedUrl = useRef(false)

  const { messages, status, sendMessage, stop } = useChat({
    id,
    messages: initialMessages,
    transport,
    experimental_throttle: 50,
    onError: (error) => {
      toast.error("发送失败", {
        description: error.message || "请稍后重试",
      })
    },
  })

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!message.text?.trim()) {
        return
      }

      sendMessage({ text: message.text })
      setInput("")

      if (!hasReplacedUrl.current && initialMessages.length === 0) {
        window.history.replaceState({}, "", `/chat/${id}`)
        hasReplacedUrl.current = true
      }
    },
    [sendMessage, id, initialMessages.length]
  )

  return (
    <div className="flex h-full flex-col">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-6 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="font-semibold text-lg">开始新对话</h2>
            <p className="mt-1 text-muted-foreground text-sm">输入你的问题，AI 助手将为你解答</p>
          </div>
        </div>
      ) : (
        <ChatMessages messages={messages} status={status} />
      )}
      <ChatInput
        input={input}
        onSubmit={handleSubmit}
        setInput={setInput}
        status={status}
        stop={stop}
      />
    </div>
  )
}
