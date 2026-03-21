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

    // Only companies can approve stages
    if (auth.user?.role !== 'company') {
      return NextResponse.json(
        { error: 'Only companies can approve stage requests' },
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

    // Check if the company owns this stage
    if (auth.user?.userId !== stage.companyId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to approve this stage request' },
        { status: 403 }
      );
    }

    // Check if stage is pending
    if (stage.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot approve stage with status: ${stage.status}` },
        { status: 400 }
      );
    }

    // Approve the stage
    stage.status = 'approved';
    stage.rejectionReason = undefined;
    await stage.save();

    const updatedStage = await Stage.findById(id)
      .populate('studentId', 'name email phone')
      .populate('companyId', 'name companyName')
      .populate('supervisorId', 'name email');

    return NextResponse.json(
      {
        message: 'Stage request approved successfully',
        stage: updatedStage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Approve stage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve stage' },
      { status: 500 }
    );
  }
}
