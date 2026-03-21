import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if (!auth.isValid) {
      return auth.response!;
    }

    return NextResponse.json(
      {
        message: 'Token is valid',
        user: auth.user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Token verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
