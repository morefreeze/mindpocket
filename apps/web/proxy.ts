import { type NextRequest, NextResponse } from "next/server"

const publicRoutes = ["/login", "/signup", "/api/auth", "/api/check-registration"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get("origin") ?? ""
  const isChromeExtension = origin.startsWith("chrome-extension://")

  // Chrome 扩展 CORS 预检请求
  if (request.method === "OPTIONS" && isChromeExtension && pathname.startsWith("/api/")) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
      },
    })
  }

  // 允许公开路由
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    const response = NextResponse.next()
    if (isChromeExtension) {
      response.headers.set("Access-Control-Allow-Origin", origin)
      response.headers.set("Access-Control-Allow-Credentials", "true")
    }
    return response
  }

  // 检查 session cookie（生产环境 HTTPS 下 cookie 带 __Secure- 前缀）
  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token")

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const response = NextResponse.next()
  if (isChromeExtension) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
