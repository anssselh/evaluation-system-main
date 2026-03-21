import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import { requireAuth } from '@/lib/auth-middleware';
import { ReviewReportSchema } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    await connectDB();

    const { id } = await params;
    const report = await Report.findById(id)
      .populate('stageId', 'title position department')
      .populate('studentId', 'name email')
      .populate('supervisorId', 'name email');

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report, { status: 200 });
  } catch (error: any) {
    console.error('[v0] Fetch report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch report' },
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
    const report = await Report.findById(id);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check authorization - only the student who created it can edit
    if (auth.user?.userId !== report.studentId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to update this report' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Allow supervisor to review the report
    if (auth.user?.userId === report.supervisorId.toString()) {
      const validationResult = ReviewReportSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationResult.error.errors },
          { status: 400 }
        );
      }

      report.rating = validationResult.data.rating;
      report.feedback = validationResult.data.feedback;
      report.status = 'reviewed';
      await report.save();

      return NextResponse.json(
        {
          message: 'Report reviewed successfully',
          report,
        },
        { status: 200 }
      );
    }

    // Student can update draft report
    if (report.status === 'draft') {
      Object.assign(report, body);
      await report.save();

      return NextResponse.json(
        {
          message: 'Report updated successfully',
          report,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Cannot update submitted or reviewed report' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[v0] Update report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update report' },
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
    const report = await Report.findById(id);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Only student can delete draft reports
    if (
      auth.user?.userId !== report.studentId.toString() ||
      report.status !== 'draft'
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this report' },
        { status: 403 }
      );
    }

    await Report.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Report deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Delete report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete report' },
      { status: 500 }
    );
  }
}

// Submit report endpoint
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    await connectDB();

    const { id } = await params;
    const report = await Report.findById(id);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Only student can submit
    if (auth.user?.userId !== report.studentId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to submit this report' },
        { status: 403 }
      );
    }

    if (report.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft reports can be submitted' },
        { status: 400 }
      );
    }

    report.status = 'submitted';
    report.submittedAt = new Date();
    await report.save();

    return NextResponse.json(
      {
        message: 'Report submitted successfully',
        report,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Submit report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit report' },
      { status: 500 }
    );
  }
}
