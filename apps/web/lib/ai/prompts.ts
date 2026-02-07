import { generateText } from "ai"
import { getTitleModel } from "./provider"

export const systemPrompt = `你是 MindPocket 的 AI 助手，一个友好、专业的中英文双语助手。
你擅长回答各种问题，包括编程、学习、写作等。
请用 Markdown 格式回复，代码块请标注语言类型。
如果用户使用中文提问，请用中文回答；如果用户使用英文提问，请用英文回答。`

const titlePrompt =
  "根据用户的第一条消息，生成一个简短的聊天标题（2-5个词），不要使用引号或标点符号。直接返回标题文本。"

export async function generateTitleFromUserMessage({ message }: { message: string }) {
  const { text: title } = await generateText({
    model: getTitleModel(),
    system: titlePrompt,
    prompt: message,
  })

  return title.trim()
}
