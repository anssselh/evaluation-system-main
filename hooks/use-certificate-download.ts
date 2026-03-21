import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook to handle certificate PDF download
 * Uses html2pdf library to generate PDF from HTML
 */
export function useCertificateDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCertificate = async (
    certificateId: string,
    certificateNumber: string
  ) => {
    if (isDownloading) {
      toast.info('Download already in progress');
      return;
    }

    setIsDownloading(true);

    try {
      const token = localStorage.getItem('token');

      console.log('[DEBUG] Starting certificate download:', certificateId);
      toast.info('Preparing certificate...');

      // Fetch the certificate HTML
      const response = await fetch(`/api/certificates/${certificateId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('[DEBUG] Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('[ERROR] Download failed:', error);
        toast.error(error.error || 'Failed to download certificate');
        return;
      }

      const data = await response.json();
      const { html, studentName } = data;

      console.log('[DEBUG] Received HTML, student:', studentName);

      // Check if html2pdf is available
      if (typeof window !== 'undefined' && (window as any).html2pdf) {
        console.log('[DEBUG] html2pdf available, generating PDF...');

        // Create an iframe to completely isolate from page CSS
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '900px';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          throw new Error('Failed to access iframe document');
        }

        // Write HTML directly to iframe (isolated from global CSS)
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Wait for iframe to fully load
        await new Promise(resolve => setTimeout(resolve, 100));

        const element = iframeDoc.body;

        const options = {
          margin: 0,
          filename: `Certificate-${certificateNumber}-${studentName}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            width: 900,
            height: 600,
            backgroundColor: '#ffffff',
            windowWidth: 900,
            windowHeight: 600,
          },
          jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
        };

        toast.info('Generating PDF...');

        try {
          await (window as any).html2pdf().set(options).from(element).save();
          console.log('[SUCCESS] PDF generated successfully');
          toast.success('Certificate downloaded successfully');
        } catch (pdfError) {
          console.error('[ERROR] PDF generation failed:', pdfError);
          toast.error('PDF generation failed. Trying HTML download...');

          // Fallback to HTML download
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Certificate-${certificateNumber}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } finally {
          // Clean up iframe
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }
      } else {
        console.log('[WARNING] html2pdf not available, downloading as HTML');
        // Fallback: download as HTML
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificate-${certificateNumber}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.warning('Certificate downloaded as HTML. PDF library not available.');
      }
    } catch (error) {
      console.error('[ERROR] Download error:', error);
      toast.error('Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadCertificate, isDownloading };
}
