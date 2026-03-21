import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Stage from '@/models/Stage';
import { requireAuth } from '@/lib/auth-middleware';
import { CreateStageSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = auth.user?.role;
    const userId = auth.user?.userId;

    let query: any = {};

    // Filter by role
    if (role === 'student') {
      query.studentId = userId;
    } else if (role === 'company') {
      query.companyId = userId;
    } else if (role === 'supervisor') {
      query.supervisorId = userId;
    }

    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    const stages = await Stage.find(query)
      .populate('studentId', 'name email')
      .populate('companyId', 'name companyName')
      .populate('supervisorId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(stages, { status: 200 });
  } catch (error: any) {
    console.error('[v0] Fetch stages error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    // Only students can create stages
    if (auth.user?.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can create stages' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate input
    const validationResult = CreateStageSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('VALIDATION ERROR:', validationResult.error.errors);

      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const stageData = {
      ...validationResult.data,
      studentId: auth.user.userId,
      startDate: new Date(validationResult.data.startDate),
      endDate: new Date(validationResult.data.endDate),
    };

    const stage = await Stage.create(stageData);

    return NextResponse.json(
      {
        message: 'Stage created successfully',
        stage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[v0] Create stage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create stage' },
      { status: 500 }
    );
  }
}
