import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthHeader, TokenPayload } from './jwt';

export async function requireAuth(
  request: NextRequest
): Promise<{ isValid: boolean; user?: TokenPayload; response?: NextResponse }> {
  try {
    const authHeader = request.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (!user) {
      return {
        isValid: false,
        response: NextResponse.json(
          { error: 'Unauthorized - Invalid or missing token' },
          { status: 401 }
        ),
      };
    }

    return {
      isValid: true,
      user,
    };
  } catch (error) {
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'Authorization failed' },
        { status: 401 }
      ),
    };
  }
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ isValid: boolean; user?: TokenPayload; response?: NextResponse }> {
  const auth = await requireAuth(request);

  if (!auth.isValid || !auth.user) {
    return auth;
  }

  if (!allowedRoles.includes(auth.user.role)) {
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return auth;
}
