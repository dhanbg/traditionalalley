import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { Session } from "next-auth";

export interface AuthenticatedRequest extends NextRequest {
  auth?: Session;
}

/**
 * Authentication middleware for API routes
 * @param req - NextRequest object
 * @returns Session if authenticated, null if not
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<Session | null> {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Check if user has required role
 * @param session - User session
 * @param requiredRole - Required role (admin, user, etc.)
 * @returns boolean
 */
export function hasRequiredRole(session: Session | null, requiredRole: string): boolean {
  return session?.user?.role === requiredRole;
}

/**
 * Get user ID from session
 * @param session - User session
 * @returns User ID string or null
 */
export function getUserId(session: Session | null): string | null {
  return session?.user?.id || null;
}

/**
 * Create standardized authentication error response
 */
export function createAuthError(message: string = "Unauthorized") {
  return {
    error: message,
    status: 401
  };
}

/**
 * Create standardized authorization error response
 */
export function createAuthzError(message: string = "Forbidden") {
  return {
    error: message,
    status: 403
  };
} 