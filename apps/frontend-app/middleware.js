// middleware.js (optional - untuk proteksi server-side)
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  // Only apply to protected routes
  const protectedRoutes = ["/event/create", "/", "/profile"];
  const { pathname } = request.nextUrl;

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get token from cookie or header
  const token =
    request.cookies.get("authToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    // Token invalid or expired
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("authToken");
    return response;
  }
}

export const config = {
  matcher: ["/event/create/:path*", "/:path*", "/profile/:path*"],
};
