import { Report } from '../types';
import { format } from 'date-fns';

export const generateReportPDF = async (report: Report, elementId?: string): Promise<void> => {
  try {
    const jsPDF = (await import('jspdf')).default;
    const html2canvas = (await import('html2canvas')).default;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Technical Machinery Report', margin, 30);

    // Client Information
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    let yPosition = 50;

    pdf.text(`Client: ${report.client_name}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Machine: ${report.machine_type} - ${report.model}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Serial Number: ${report.serial_number}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Hourmeter: ${report.hourmeter} hrs`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Date: ${format(report.report_date, 'PPP')}`, margin, yPosition);
    yPosition += 8;

    // Components
    if (report.components && report.components.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Component Assessment:', margin, yPosition);
      yPosition += 10;

      report.components.forEach((component, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 30;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${component.type}`, margin, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.text(`Status: ${component.status}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Priority: ${component.priority}`, margin + 5, yPosition);
        yPosition += 6;

        // Findings
        const findingsLines = pdf.splitTextToSize(`Findings: ${component.findings}`, pageWidth - 2 * margin);
        pdf.text(findingsLines, margin + 5, yPosition);
        yPosition += findingsLines.length * 6;

        // Parameters
        const parametersLines = pdf.splitTextToSize(`Parameters: ${component.parameters}`, pageWidth - 2 * margin);
        pdf.text(parametersLines, margin + 5, yPosition);
        yPosition += parametersLines.length * 6;

        // Suggestions
        const suggestionsLines = pdf.splitTextToSize(`Suggestions: ${component.suggestions}`, pageWidth - 2 * margin);
        pdf.text(suggestionsLines, margin + 5, yPosition);
        yPosition += suggestionsLines.length * 6 + 5;
      });
    }

    // Conclusions
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 30;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('Conclusions:', margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    const conclusionsLines = pdf.splitTextToSize(report.conclusions || '', pageWidth - 2 * margin);
    pdf.text(conclusionsLines, margin, yPosition);
    yPosition += conclusionsLines.length * 6 + 15;

    // Suggested Parts
    if (report.suggested_parts && report.suggested_parts.length > 0) {
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.text('Suggested Parts:', margin, yPosition);
      yPosition += 10;

      report.suggested_parts.forEach((part, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }

        pdf.setFont('helvetica', 'normal');
        pdf.text(`${index + 1}. ${part.description}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`   Part Number: ${part.part_number}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`   Quantity: ${part.quantity}`, margin, yPosition);
        yPosition += 10;
      });

      // Total cost (si existe unitPrice en SuggestedPart, si no, omitir)
      // const totalCost = report.suggested_parts.reduce((sum, part) => sum + (part.quantity * (part.unitPrice || 0)), 0);
      // pdf.setFont('helvetica', 'bold');
      // pdf.text(`Total Parts Cost: $${totalCost.toFixed(2)}`, margin, yPosition);
    }

    // Save the PDF
    const fileName = `${report.client_name.replace(/\s+/g, '_')}_${report.serial_number}_${format(report.report_date, 'yyyy-MM-dd')}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};