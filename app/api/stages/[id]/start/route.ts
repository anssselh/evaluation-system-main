import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Stage from '@/models/Stage';
import { requireAuth } from '@/lib/auth-middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    // Only students can start their stages
    if (auth.user?.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can start their stages' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const stage = await Stage.findById(id);

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Check if the student owns this stage
    if (auth.user?.userId !== stage.studentId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to start this stage' },
        { status: 403 }
      );
    }

    // Check if stage is approved
    if (stage.status !== 'approved') {
      return NextResponse.json(
        { error: `Cannot start stage with status: ${stage.status}. The stage must be approved by the company first.` },
        { status: 400 }
      );
    }

    // Start the stage
    stage.status = 'in_progress';
    await stage.save();

    const updatedStage = await Stage.findById(id)
      .populate('studentId', 'name email phone')
      .populate('companyId', 'name companyName')
      .populate('supervisorId', 'name email');

    return NextResponse.json(
      {
        message: 'Stage started successfully',
        stage: updatedStage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Start stage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start stage' },
      { status: 500 }
    );
  }
}
