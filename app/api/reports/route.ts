import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import Stage from '@/models/Stage';
import { requireAuth } from '@/lib/auth-middleware';
import { CreateReportSchema } from '@/lib/validation';

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
    }

    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('stageId', 'title position department')
      .populate('studentId', 'name email')
      .populate('companyId', 'name companyName')
      .sort({ createdAt: -1 });

    return NextResponse.json(reports, { status: 200 });
  } catch (error: any) {
    console.error('[v0] Fetch reports error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    // Only students can create reports
    if (auth.user?.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can create reports' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate input
    const validationResult = CreateReportSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Verify stage exists and belongs to student
    const stage = await Stage.findById(validationResult.data.stageId)
      .populate('companyId', '_id');

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    if (stage.studentId.toString() !== auth.user?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to create report for this stage' },
        { status: 403 }
      );
    }

    // Check if stage is approved or completed
    if (stage.status !== 'approved' && stage.status !== 'in_progress' && stage.status !== 'completed') {
      return NextResponse.json(
        {
          error: `Cannot create report for stage with status: ${stage.status}. The internship must be approved by the company first.`,
        },
        { status: 400 }
      );
    }

    const reportData = {
      ...validationResult.data,
      studentId: auth.user.userId,
      companyId: stage.companyId._id,
      stageId: validationResult.data.stageId,
    };

    const report = await Report.create(reportData);

    return NextResponse.json(
      {
        message: 'Report created successfully',
        report,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[v0] Create report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create report' },
      { status: 500 }
    );
  }
}
