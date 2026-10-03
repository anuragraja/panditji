import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, JWTPayload } from "./jwt";

export interface AdminAuthResult {
  authorized: boolean;
  user?: JWTPayload;
  response?: NextResponse;
}

export function requireAdmin(req: NextRequest): AdminAuthResult {
  const user = getUserFromRequest(req);

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: "Authentication required. Please log in." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: "Forbidden. Admin privileges required." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user,
  };
}

export function requireCustomer(req: NextRequest): AdminAuthResult {
  const user = getUserFromRequest(req);

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: "Authentication required. Please log in." },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true,
    user,
  };
}
