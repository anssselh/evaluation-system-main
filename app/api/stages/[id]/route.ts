import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Stage from '@/models/Stage';
import { requireAuth } from '@/lib/auth-middleware';
import { UpdateStageSchema } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    await connectDB();

    const { id } = await params;
    const stage = await Stage.findById(id)
      .populate('studentId', 'name email phone address')
      .populate('companyId', 'name companyName email phone')
      .populate('supervisorId', 'name email');

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stage, { status: 200 });
  } catch (error: any) {
    console.error('[v0] Fetch stage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stage' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    await connectDB();

    const { id } = await params;
    const stage = await Stage.findById(id);

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Check authorization - student or supervisor can update
    if (
      auth.user?.userId !== stage.studentId.toString() &&
      auth.user?.userId !== stage.supervisorId?.toString()
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to update this stage' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = UpdateStageSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = {
      ...validationResult.data,
      startDate: validationResult.data.startDate ? new Date(validationResult.data.startDate) : undefined,
      endDate: validationResult.data.endDate ? new Date(validationResult.data.endDate) : undefined,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedStage = await Stage.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      {
        message: 'Stage updated successfully',
        stage: updatedStage,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Update stage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update stage' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    await connectDB();

    const { id } = await params;
    const stage = await Stage.findById(id);

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Only student can delete
    if (auth.user?.userId !== stage.studentId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this stage' },
        { status: 403 }
      );
    }

    await Stage.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Stage deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Delete stage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete stage' },
      { status: 500 }
    );
  }
}
