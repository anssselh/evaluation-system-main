import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Stage from '@/models/Stage';
import { requireAuth } from '@/lib/auth-middleware';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    // Only students can apply for internships
    if (auth.user?.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can apply for internships' },
        { status: 403 }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const companyId = formData.get('companyId') as string;
    const studentName = formData.get('studentName') as string;
    const university = formData.get('university') as string;
    const studentEmail = formData.get('studentEmail') as string;
    const cvFile = formData.get('cvFile') as File;

    // Validate required fields
    if (!companyId || !studentName || !university || !studentEmail) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (!cvFile) {
      return NextResponse.json(
        { error: 'Please upload your CV' },
        { status: 400 }
      );
    }

    // Validate file type
    if (cvFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'CV must be a PDF file' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (cvFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'CV file size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'cvs');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `cv-${auth.user.userId}-${timestamp}-${cvFile.name}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    const bytes = await cvFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create internship application
    const applicationData = {
      studentId: auth.user.userId,
      companyId,
      studentName,
      university,
      studentEmail,
      cvFile: `/uploads/cvs/${fileName}`,
      cvFileName: cvFile.name,
      cvFileSize: cvFile.size,
      tasks: [],
      achievements: [],
      status: 'pending',
    };

    const application = await Stage.create(applicationData);

    const populatedApplication = await Stage.findById(application._id)
      .populate('studentId', 'name email')
      .populate('companyId', 'name companyName');

    return NextResponse.json(
      {
        message: 'Internship application submitted successfully',
        application: populatedApplication,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[ERROR] Apply for internship error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
