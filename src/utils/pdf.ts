import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Report } from '../types';
import { format } from 'date-fns';

export const generateReportPDF = async (report: Report, elementId?: string): Promise<void> => {
  try {
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

    pdf.text(`Client: ${report.clientName}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Contact: ${report.clientContact}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Machine: ${report.machineType} - ${report.model}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Serial Number: ${report.serialNumber}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Hourmeter: ${report.hourmeter} hrs`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Date: ${format(report.date, 'PPP')}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Location: ${report.location}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Technician: ${report.technicianName}`, margin, yPosition);
    yPosition += 15;

    // Components
    if (report.components.length > 0) {
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
    const conclusionsLines = pdf.splitTextToSize(report.conclusions, pageWidth - 2 * margin);
    pdf.text(conclusionsLines, margin, yPosition);
    yPosition += conclusionsLines.length * 6 + 15;

    // Suggested Parts
    if (report.suggestedParts.length > 0) {
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 30;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.text('Suggested Parts:', margin, yPosition);
      yPosition += 10;

      report.suggestedParts.forEach((part, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }

        pdf.setFont('helvetica', 'normal');
        pdf.text(`${index + 1}. ${part.description}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`   Part Number: ${part.partNumber}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`   Quantity: ${part.quantity}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`   Unit Price: $${part.unitPrice.toFixed(2)}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`   Total: $${(part.quantity * part.unitPrice).toFixed(2)}`, margin, yPosition);
        yPosition += 10;
      });

      // Total cost
      const totalCost = report.suggestedParts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total Parts Cost: $${totalCost.toFixed(2)}`, margin, yPosition);
    }

    // Save the PDF
    const fileName = `${report.clientName.replace(/\s+/g, '_')}_${report.serialNumber}_${format(report.date, 'yyyy-MM-dd')}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};