import { getItem } from "expo-secure-store"
import { getServerUrl } from "./server-config"

const IS_WEB = typeof document !== "undefined"

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

function getCookie(): string {
  const raw = getItem("mindpocket_cookie") || "{}"
  let parsed: Record<string, { value: string; expires: string | null }> = {}
  try {
    parsed = JSON.parse(raw)
  } catch {
    return ""
  }
  return Object.entries(parsed)
    .filter(([, v]) => !v.expires || new Date(v.expires) > new Date())
    .map(([key, v]) => `${key}=${v.value}`)
    .join("; ")
}

export function createHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) }
  if (IS_WEB) {
    return headers
  }

  const cookie = getCookie()
  if (cookie) {
    headers.cookie = cookie
  }
  return headers
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getServerUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: createHeaders((init?.headers || undefined) as Record<string, string> | undefined),
  })

  if (!response.ok) {
    const message = (await response.text()) || "Request failed"
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as T
}

export async function requestVoid(path: string, init?: RequestInit): Promise<void> {
  const response = await fetch(`${getServerUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: createHeaders((init?.headers || undefined) as Record<string, string> | undefined),
  })

  if (!response.ok) {
    const message = (await response.text()) || "Request failed"
    throw new ApiError(response.status, message)
  }
}
