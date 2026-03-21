import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Certificate from '@/models/Certificate';
import User from '@/models/User';
import Stage from '@/models/Stage';
import { requireAuth } from '@/lib/auth-middleware';
import { generateCertificateHTML } from '@/lib/certificate-generator';

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
      .populate('studentId')
      .populate('companyId')
      .populate('stageId');

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Check authorization - only student or company can download
    if (
      auth.user?.userId !== certificate.studentId._id.toString() &&
      auth.user?.userId !== certificate.companyId._id.toString()
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to download this certificate' },
        { status: 403 }
      );
    }

    // Generate certificate HTML
    const certificateHTML = generateCertificateHTML({
      certificateNumber: certificate.certificateNumber,
      studentName: certificate.studentId.name,
      companyName: certificate.companyId.companyName || certificate.companyId.name,
      position: certificate.stageId?.position || 'Intern',
      issueDate: new Date(certificate.issueDate),
      expiryDate: certificate.expiryDate ? new Date(certificate.expiryDate) : undefined,
      competencies: certificate.competencies,
      achievements: certificate.achievements,
      blockchainHash: certificate.blockchainHash,
    });

    // Return HTML + real blockchain data for client-side PDF generation and UI display
    return NextResponse.json(
      {
        html:              certificateHTML,
        certificateNumber: certificate.certificateNumber,
        studentName:       certificate.studentId.name,
        blockchain: {
          txHash:          certificate.txHash          ?? null,
          blockNumber:     certificate.blockNumber      ?? null,
          contractAddress: certificate.contractAddress  ?? null,
          gasUsed:         certificate.gasUsed          ?? null,
          walletAddress:   certificate.walletAddress    ?? null,
          status:          certificate.blockchainStatus,
          network:         'Ganache Local (http://127.0.0.1:7545)',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Certificate download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
