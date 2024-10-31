import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

type UserRole = "ADMIN" | "GUIDE" | "USER";

interface Token {
  role?: UserRole;
}

const allowedPaths: Record<UserRole, string[]> = {
  ADMIN: ["/admin"],
  GUIDE: ["/guide"],
  USER: ["/"], // Assuming regular users are allowed on the home page
};

const publicFilePattern =
  /\.(jpg|jpeg|png|gif|svg|ico|css|js|mp4|webm|ogg|mp3|wav)$/i;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow access to login, API routes, dashboard, and public files (including videos)
  if (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/api") ||
    path === "/" ||
    publicFilePattern.test(path)
  ) {
    return NextResponse.next();
  }

  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as Token | null;

  // If no token and not trying to access allowed paths, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If there's a token, proceed with role-based access control
  const userRole = token.role as UserRole;
  if (!userRole || !Object.keys(allowedPaths).includes(userRole)) {
    // Handle case where role is missing or invalid
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isAllowedPath = allowedPaths[userRole].some((allowedPath) =>
    path.startsWith(allowedPath)
  );
  if (!isAllowedPath) {
    let redirectPath;
    switch (userRole) {
      case "ADMIN":
        redirectPath = "/admin/dashboard";
        break;
      case "GUIDE":
        redirectPath = "/guide-dashboard";
        break;
      case "USER":
        redirectPath = "/";
        break;
    }
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
