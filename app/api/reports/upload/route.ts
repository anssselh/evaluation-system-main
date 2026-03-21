import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import Stage from '@/models/Stage';
import { requireAuth } from '@/lib/auth-middleware';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    // Only students can upload reports
    if (auth.user?.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can upload reports' },
        { status: 403 }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const stageId = formData.get('stageId') as string;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!stageId || !title) {
      return NextResponse.json(
        { error: 'Stage ID and title are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Verify stage exists and belongs to student
    const stage = await Stage.findById(stageId)
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `report-${auth.user.userId}-${timestamp}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create report in database
    const reportData = {
      stageId,
      title,
      studentId: auth.user.userId,
      companyId: stage.companyId._id,
      supervisorId: stage.supervisorId || null,
      pdfFile: `/uploads/reports/${fileName}`,
      fileName: file.name,
      fileSize: file.size,
      content: '',
      activitiesPerformed: [],
      competenciesDeveloped: [],
      challenges: [],
      learnings: [],
    };

    const report = await Report.create(reportData);

    return NextResponse.json(
      {
        message: 'Technical report uploaded successfully',
        report,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[v0] Upload report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload report' },
      { status: 500 }
    );
  }
}
