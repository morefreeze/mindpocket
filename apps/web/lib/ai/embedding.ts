import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { embed, embedMany } from "ai"
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm"
import { nanoid } from "nanoid"
import { db } from "@/db/client"
import { bookmark } from "@/db/schema/bookmark"
import { embedding } from "@/db/schema/embedding"

const aliyun = createOpenAICompatible({
  name: "aliyun",
  apiKey: process.env.EMBEDDING_API_KEY!,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
})

const embeddingModel = aliyun.embeddingModel("text-embedding-v4")
const CHUNK_SPLIT_REGEX = /[。.!\n]+/

export function generateChunks(input: string): string[] {
  return input
    .trim()
    .split(CHUNK_SPLIT_REGEX)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export async function generateEmbedding(value: string): Promise<number[]> {
  const { embedding: vector } = await embed({
    model: embeddingModel,
    value,
  })
  return vector
}

const EMBED_BATCH_SIZE = 10

export async function generateEmbeddings(
  bookmarkId: string,
  content: string
): Promise<Array<{ id: string; bookmarkId: string; content: string; embedding: number[] }>> {
  const chunks = generateChunks(content)
  if (chunks.length === 0) {
    return []
  }

  const allEmbeddings: number[][] = []

  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE)
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: batch,
    })
    allEmbeddings.push(...embeddings)
  }

  return allEmbeddings.map((vector, i) => ({
    id: nanoid(),
    bookmarkId,
    content: chunks[i]!,
    embedding: vector,
  }))
}

export async function findRelevantContent(userId: string, userQuery: string) {
  const userQueryEmbedded = await generateEmbedding(userQuery)

  const similarity = sql<number>`1 - (${cosineDistance(embedding.embedding, userQueryEmbedded)})`

  const results = await db
    .select({
      content: embedding.content,
      bookmarkId: embedding.bookmarkId,
      similarity,
    })
    .from(embedding)
    .innerJoin(bookmark, eq(embedding.bookmarkId, bookmark.id))
    .where(and(eq(bookmark.userId, userId), eq(bookmark.isArchived, false), gt(similarity, 0.3)))
    .orderBy((t) => desc(t.similarity))
    .limit(6)

  return results
}
