"use client"

import type { ChatStatus } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { ChatMessage } from "@/components/chat-message"

export function ChatMessages({ messages, status }: { messages: UIMessage[]; status: ChatStatus }) {
  const isStreaming = status === "streaming" || status === "submitted"

  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1
          return (
            <ChatMessage
              isStreaming={isStreaming && isLastMessage}
              key={message.id}
              message={message}
            />
          )
        })}
        {status === "submitted" && messages.at(-1)?.role !== "assistant" && (
          <div className="text-muted-foreground text-sm">
            <Shimmer duration={1}>思考中...</Shimmer>
          </div>
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
