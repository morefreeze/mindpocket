"use client"

import type { ChatStatus } from "@ai-sdk/react"
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input"

export function ChatInput({
  input,
  setInput,
  onSubmit,
  status,
  stop,
}: {
  input: string
  setInput: (value: string) => void
  onSubmit: (message: PromptInputMessage) => void
  status: ChatStatus
  stop: () => void
}) {
  return (
    <div className="w-full px-4 pb-4">
      <PromptInput onSubmit={onSubmit}>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            value={input}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <div />
          <PromptInputSubmit onStop={stop} status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
