import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.isValid) return auth.response!;

    await connectDB();

    const { id } = await params;
    const certificate = await Certificate.findById(id)
      .populate('stageId', 'title position department studentId')
      .populate('studentId', 'name email')
      .populate('companyId', 'name companyName');

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(certificate, { status: 200 });
  } catch (error: any) {
    console.error('[v0] Fetch certificate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch certificate' },
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
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Only company can update
    if (auth.user?.userId !== certificate.companyId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to update this certificate' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { certificateUrl, status, blockchainStatus } = body;

    if (certificateUrl) {
      certificate.certificateUrl = certificateUrl;
    }

    if (status) {
      certificate.status = status;
    }

    if (blockchainStatus) {
      certificate.blockchainStatus = blockchainStatus;
    }

    await certificate.save();

    return NextResponse.json(
      {
        message: 'Certificate updated successfully',
        certificate,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Update certificate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update certificate' },
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
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Only company can delete
    if (auth.user?.userId !== certificate.companyId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this certificate' },
        { status: 403 }
      );
    }

    await Certificate.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Certificate deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Delete certificate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete certificate' },
      { status: 500 }
    );
  }
}
