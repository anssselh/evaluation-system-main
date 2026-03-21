import crypto from 'crypto';

export interface CertificateData {
  certificateNumber: string;
  studentName: string;
  companyName: string;
  position: string;
  issueDate: Date;
  expiryDate?: Date;
  competencies: string[];
  achievements: string[];
  blockchainHash?: string;
}

/**
 * Generate SHA-256 hash for blockchain verification
 */
export function generateCertificateHash(data: CertificateData): string {
  const hashInput = `${data.certificateNumber}${data.studentName}${data.issueDate.getTime()}`;
  return crypto.createHash('sha256').update(hashInput).digest('hex');
}

/**
 * Generate certificate HTML content
 */
export function generateCertificateHTML(data: CertificateData): string {
  const formattedIssueDate = data.issueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const expiryText = data.expiryDate
    ? `<p class="expiry">Valid until: ${data.expiryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</p>`
    : '';

  const competenciesHTML = data.competencies
    .map((c) => `<li>${c}</li>`)
    .join('');

  const achievementsHTML = data.achievements
    .map((a) => `<li>${a}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Internship Certificate</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f0f0;
            padding: 20px;
        }
        
        .certificate {
            width: 100%;
            max-width: 900px;
            height: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
            border: 3px solid #1e293b;
            padding: 50px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            position: relative;
            overflow: hidden;
        }
        
        .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #3b82f6, #06b6d4);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: bold;
        }
        
        h1 {
            font-size: 48px;
            color: #1e293b;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .subtitle {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 20px;
        }
        
        .content {
            margin: 30px 0;
        }
        
        .student-info {
            text-align: center;
            margin: 30px 0;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            padding: 20px 0;
        }
        
        .student-name {
            font-size: 32px;
            color: #1e293b;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .position-company {
            font-size: 18px;
            color: #475569;
            margin-bottom: 5px;
        }
        
        .company {
            font-size: 16px;
            color: #64748b;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
        }
        
        .detail-section h3 {
            font-size: 14px;
            color: #1e293b;
            font-weight: 600;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .detail-section ul {
            list-style: none;
            font-size: 13px;
            color: #475569;
            line-height: 1.8;
        }
        
        .detail-section li {
            margin-bottom: 5px;
            padding-left: 20px;
            position: relative;
        }
        
        .detail-section li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #3b82f6;
            font-weight: bold;
        }
        
        .footer {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-top: 40px;
            font-size: 12px;
            color: #64748b;
            text-align: center;
        }
        
        .footer-item {
            border-top: 1px solid #1e293b;
            padding-top: 10px;
        }
        
        .date-info {
            font-size: 12px;
            color: #64748b;
            margin-top: 20px;
            text-align: center;
        }
        
        .expiry {
            margin-top: 5px;
            color: #f97316;
            font-weight: 600;
        }
        
        .blockchain-info {
            font-size: 10px;
            color: #94a3b8;
            word-break: break-all;
            margin-top: 10px;
            padding: 10px;
            background: #f1f5f9;
            border-radius: 4px;
            border-left: 3px solid #06b6d4;
        }
        
        @media print {
            body {
                background: none;
                padding: 0;
            }
            .certificate {
                box-shadow: none;
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="logo">IE</div>
            <h1>Certificate of Internship Completion</h1>
            <p class="subtitle">This certificate recognizes the successful completion of an internship program</p>
        </div>
        
        <div class="student-info">
            <p class="student-name">${data.studentName}</p>
            <p class="position-company">for completing an internship as</p>
            <p class="position-company" style="font-weight: 600; color: #1e293b;">${data.position}</p>
            <p class="company">at ${data.companyName}</p>
        </div>
        
        <div class="details-grid">
            <div class="detail-section">
                <h3>Competencies Developed</h3>
                <ul>
                    ${competenciesHTML}
                </ul>
            </div>
            <div class="detail-section">
                <h3>Key Achievements</h3>
                <ul>
                    ${achievementsHTML}
                </ul>
            </div>
        </div>
        
        <div class="date-info">
            <p>Issued on ${formattedIssueDate}</p>
            ${expiryText}
            <p style="margin-top: 10px;">Certificate No: <strong>${data.certificateNumber}</strong></p>
            ${
              data.blockchainHash
                ? `<div class="blockchain-info">Blockchain Hash: ${data.blockchainHash}</div>`
                : ''
            }
        </div>
        
        <div class="footer">
            <div class="footer-item">
                <p style="font-weight: 600; margin-bottom: 20px;">_____________</p>
                <p>Student Signature</p>
            </div>
            <div class="footer-item">
                <p style="font-weight: 600; margin-bottom: 20px;">_____________</p>
                <p>Supervisor Signature</p>
            </div>
            <div class="footer-item">
                <p style="font-weight: 600; margin-bottom: 20px;">_____________</p>
                <p>Company Official</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Generate certificate PDF blob (requires html2pdf or similar on client-side)
 */
export async function generateCertificatePDF(
  data: CertificateData
): Promise<Blob> {
  // This will be used on the client-side with html2pdf library
  const html = generateCertificateHTML(data);

  // For now, return the HTML as a blob with appropriate MIME type
  return new Blob([html], { type: 'text/html' });
}
