import { toast } from 'sonner';

/**
 * Hook to handle certificate PDF download
 * Uses html2pdf library to generate PDF from HTML
 */
export function useCertificateDownload() {
  const downloadCertificate = async (
    certificateId: string,
    certificateNumber: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch the certificate HTML
      const response = await fetch(`/api/certificates/${certificateId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to download certificate');
        return;
      }

      const data = await response.json();
      const { html, studentName } = data;

      // Check if html2pdf is available
      if (typeof window !== 'undefined' && (window as any).html2pdf) {
        const element = document.createElement('div');
        element.innerHTML = html;

        const options = {
          margin: 0,
          filename: `Certificate-${certificateNumber}-${studentName}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
        };

        (window as any).html2pdf().set(options).from(element).save();
        toast.success('Certificate downloaded successfully');
      } else {
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
        toast.success('Certificate downloaded as HTML. Please install html2pdf for PDF format.');
      }
    } catch (error) {
      console.error('[v0] Download error:', error);
      toast.error('Failed to download certificate');
    }
  };

  return { downloadCertificate };
}
