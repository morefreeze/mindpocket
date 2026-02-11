import { ApiError, createHeaders, requestJson } from "./api-client"
import { getServerUrl } from "./server-config"

export interface IngestResult {
  id: string
  title: string
  status: string
  error?: string
}

export interface IngestHistoryItem {
  id: string
  title: string
  type: string
  sourceType: string | null
  clientSource: string | null
  ingestStatus: string
  ingestError: string | null
  url: string | null
  platform: string | null
  createdAt: string
}

export function ingestUrl(url: string, title?: string): Promise<IngestResult> {
  return requestJson<IngestResult>("/api/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      title: title || undefined,
      clientSource: "mobile",
    }),
  })
}

export async function ingestFile(
  fileUri: string,
  fileName: string,
  mimeType: string,
  title?: string
): Promise<IngestResult> {
  const formData = new FormData()
  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob)
  formData.append("clientSource", "mobile")
  if (title) {
    formData.append("title", title)
  }

  const response = await fetch(`${getServerUrl()}/api/ingest`, {
    method: "POST",
    credentials: "include",
    headers: createHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const message = (await response.text()) || "Upload failed"
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as IngestResult
}

export function fetchIngestHistory(
  limit = 20,
  offset = 0
): Promise<{ items: IngestHistoryItem[] }> {
  const params = new URLSearchParams()
  params.set("limit", String(limit))
  params.set("offset", String(offset))

  return requestJson<{ items: IngestHistoryItem[] }>(`/api/ingest/history?${params}`)
}
