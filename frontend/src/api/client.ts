import { getNickname } from '@/lib/nickname'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export const NICKNAME_HEADER = 'X-Nickname'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

interface ErrorBody {
  code?: string
  message?: string
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    // 한글 닉네임은 헤더에 그대로 넣을 수 없어 URL 인코딩한다. 서버에서 디코딩.
    [NICKNAME_HEADER]: encodeURIComponent(getNickname() ?? ''),
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'NETWORK_ERROR', '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    let body: ErrorBody = {}
    try {
      body = (await response.json()) as ErrorBody
    } catch {
      // 본문이 JSON 이 아닐 수 있다.
    }
    throw new ApiError(
      response.status,
      body.code ?? 'HTTP_ERROR',
      body.message ?? `요청에 실패했습니다. (${response.status})`,
    )
  }

  return (await response.json()) as T
}

export function errorMessage(error: unknown, fallback = '문제가 발생했습니다. 다시 시도해주세요.'): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}
