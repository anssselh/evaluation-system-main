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

    if (auth.user?.role !== 'company') {
      return NextResponse.json(
        { error: 'Only companies can mark a stage as completed' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const stage = await Stage.findById(id);

    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    if (stage.companyId.toString() !== auth.user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to complete this stage' },
        { status: 403 }
      );
    }

    if (stage.status !== 'in_progress') {
      return NextResponse.json(
        { error: `Cannot complete a stage with status: ${stage.status}. Stage must be in progress.` },
        { status: 400 }
      );
    }

    stage.status = 'completed';
    await stage.save();

    const updatedStage = await Stage.findById(id)
      .populate('studentId', 'name email')
      .populate('companyId', 'name companyName');

    return NextResponse.json(
      { message: 'Stage marked as completed successfully', stage: updatedStage },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Complete stage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete stage' },
      { status: 500 }
    );
  }
}
