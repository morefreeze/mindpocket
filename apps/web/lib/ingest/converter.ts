import { MarkItDown } from "markitdown-ts"
import type { BookmarkType } from "./types"
import { EXTENSION_TYPE_MAP, URL_TYPE_PATTERNS } from "./types"

let markitdownInstance: MarkItDown | null = null

function getMarkItDown(): MarkItDown {
  if (!markitdownInstance) {
    markitdownInstance = new MarkItDown()
  }
  return markitdownInstance
}

export async function convertUrl(url: string) {
  const md = getMarkItDown()
  const result = await md.convert(url)
  if (!result) return null
  return { title: result.title, markdown: result.markdown }
}

export async function convertBuffer(buffer: Buffer, fileExtension: string) {
  const md = getMarkItDown()
  const result = await md.convertBuffer(buffer, { file_extension: fileExtension })
  if (!result) return null
  return { title: result.title, markdown: result.markdown }
}

export async function convertHtml(html: string, sourceUrl: string) {
  const md = getMarkItDown()
  const response = new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  })
  const result = await md.convert(response, { url: sourceUrl })
  if (!result) return null
  return { title: result.title, markdown: result.markdown }
}

export function inferTypeFromExtension(ext: string): BookmarkType {
  return EXTENSION_TYPE_MAP[ext.toLowerCase()] ?? "other"
}

export function inferTypeFromUrl(url: string): BookmarkType {
  for (const { pattern, type } of URL_TYPE_PATTERNS) {
    if (pattern.test(url)) return type
  }
  return "link"
}

export function extractDescription(markdown: string): string {
  const text = markdown
    .replace(/^#+\s+.+$/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/[*_~`#>|-]/g, "")
    .trim()
  const firstParagraph = text.split(/\n\n/)[0] ?? ""
  return firstParagraph.slice(0, 200).trim()
}
