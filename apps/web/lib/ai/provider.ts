import { gateway } from "ai"

export function getChatModel() {
  return gateway(process.env.CHAT_MODEL || "openai/gpt-4o-mini")
}

export function getTitleModel() {
  return gateway("openai/gpt-4o-mini")
}
