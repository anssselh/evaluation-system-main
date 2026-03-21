import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import Stage from '@/models/Stage';
import { requireAuth } from '@/lib/auth-middleware';
import { GenerateCertificateSchema } from '@/lib/validation';
import crypto from 'crypto';

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

    const certificates = await Certificate.find(query)
      .populate('stageId', 'title position department')
      .populate('studentId', 'name email')
      .populate('companyId', 'name companyName')
      .sort({ createdAt: -1 });

    return NextResponse.json(certificates, { status: 200 });
  } catch (error: any) {
    console.error('[v0] Fetch certificates error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    // Only company can generate certificates
    if (auth.user?.role !== 'company') {
      return NextResponse.json(
        { error: 'Only companies can generate certificates' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate input
    console.log('POST /api/certificates body:', body);
    const validationResult = GenerateCertificateSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation errors:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Verify stage exists and company owns it
    const stage = await Stage.findById(validationResult.data.stageId)
      .populate('studentId', 'name email')
      .populate('companyId', 'name companyName');

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    if (stage.companyId._id.toString() !== auth.user?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to generate certificate for this stage' },
        { status: 403 }
      );
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ stageId: validationResult.data.stageId });
    if (existingCert) {
      return NextResponse.json(
        { error: 'Certificate already exists for this stage' },
        { status: 409 }
      );
    }

    // Generate unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Generate blockchain hash with student name and timestamp
    const hashInput = `${certificateNumber}${stage.studentId.name}${Date.now()}`;
    const blockchainHash = crypto.createHash('sha256').update(hashInput).digest('hex');

    // Create certificate data
    const certificateData = {
      ...validationResult.data,
      studentId: stage.studentId._id,
      companyId: auth.user.userId,
      stageId: validationResult.data.stageId,
      certificateNumber,
      certificateUrl: '',
      blockchainHash,
      blockchainStatus: 'confirmed', // Set as confirmed immediately
    };

    const certificate = await Certificate.create(certificateData);

    return NextResponse.json(
      {
        message: 'Certificate generated successfully',
        certificate,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[v0] Generate certificate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
