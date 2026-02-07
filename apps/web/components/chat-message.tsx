"use client"

import type { UIMessage } from "ai"
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai-elements/reasoning"

export function ChatMessage({
  message,
  isStreaming,
}: {
  message: UIMessage
  isStreaming: boolean
}) {
  return (
    <Message from={message.role}>
      <div>
        {message.parts.map((part, index) => {
          const key = `${message.id}-${index}`

          if (part.type === "reasoning") {
            return (
              <Reasoning isStreaming={isStreaming && index === message.parts.length - 1} key={key}>
                <ReasoningTrigger />
                <ReasoningContent>{part.reasoning}</ReasoningContent>
              </Reasoning>
            )
          }

          if (part.type === "text") {
            if (message.role === "user") {
              return (
                <MessageContent key={key}>
                  <p className="whitespace-pre-wrap">{part.text}</p>
                </MessageContent>
              )
            }
            return (
              <MessageContent key={key}>
                <MessageResponse>{part.text}</MessageResponse>
              </MessageContent>
            )
          }

          return null
        })}
      </div>
    </Message>
  )
}
