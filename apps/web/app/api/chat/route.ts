import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  streamText,
  type UIMessage,
} from "ai"
import { headers } from "next/headers"
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
  updateChatTitle,
} from "@/db/queries/chat"
import { generateTitleFromUserMessage, systemPrompt } from "@/lib/ai/prompts"
import { getChatModel } from "@/lib/ai/provider"
import { auth } from "@/lib/auth"

export const maxDuration = 60

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id, messages }: { id: string; messages: UIMessage[] } = await req.json()
  const userId = session.user.id

  const userMessage = messages.at(-1)
  if (!userMessage || userMessage.role !== "user") {
    return new Response("Invalid message", { status: 400 })
  }

  const existingChat = await getChatById({ id })
  const isNewChat = !existingChat

  if (isNewChat) {
    await saveChat({ id, userId, title: "新对话" })
  }

  await saveMessages({
    messages: [
      {
        id: userMessage.id,
        chatId: id,
        role: userMessage.role,
        parts: userMessage.parts,
        createdAt: new Date(),
      },
    ],
  })

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: getChatModel(),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        onFinish: async ({ response }) => {
          const assistantMessages = response.messages.filter((m) => m.role === "assistant")
          if (assistantMessages.length > 0) {
            const lastMsg = assistantMessages.at(-1)!
            await saveMessages({
              messages: [
                {
                  id: generateId(),
                  chatId: id,
                  role: "assistant",
                  parts: lastMsg.content,
                  createdAt: new Date(),
                },
              ],
            })
          }
        },
      })

      result.consumeStream()

      writer.merge(result.toUIMessageStream())

      if (isNewChat) {
        const textPart = userMessage.parts.find((p) => p.type === "text")
        if (textPart && "text" in textPart) {
          generateTitleFromUserMessage({ message: textPart.text }).then(async (title) => {
            await updateChatTitle({ chatId: id, title })
            writer.write({
              type: "data",
              data: [{ type: "title", content: title }],
            })
          })
        }
      }
    },
  })

  return createUIMessageStreamResponse({ stream })
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id }: { id: string } = await req.json()

  const chat = await getChatById({ id })
  if (!chat || chat.userId !== session.user.id) {
    return new Response("Not found", { status: 404 })
  }

  await deleteChatById({ id })
  return new Response("OK", { status: 200 })
}
