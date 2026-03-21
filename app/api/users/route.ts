import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query: any = {};

    if (role) {
      query.role = role;
    }

    // Ensure we only return public-safe fields
    const users = await User.find(query).select('_id name companyName');

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error('[v0] Fetch users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
