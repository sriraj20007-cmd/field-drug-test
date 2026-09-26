/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TestRecord } from '../types';

/**
 * Generates an official, publication-quality Forensic Field Drug Testing Audit Report PDF
 * containing the current log of test records.
 */
export async function exportTestHistoryPdf(
  records: TestRecord[],
  options?: {
    filterResult?: string;
    searchTerm?: string;
    dateRangeLabel?: string;
    title?: string;
  }
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const generatedAt = new Date().toLocaleString();

  // Color palette (Slate / Cyan forensic theme)
  const headerBgColor: [number, number, number] = [15, 23, 42]; // Slate-900
  const cyanAccent: [number, number, number] = [6, 182, 212]; // Cyan-500
  const subtextColor: [number, number, number] = [100, 116, 139]; // Slate-500
  const borderLineColor: [number, number, number] = [226, 232, 240]; // Slate-200

  // 1. Top Header Banner
  doc.setFillColor(...headerBgColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Cyan top border strip
  doc.setFillColor(...cyanAccent);
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DIGITAL COMPANION FOR FIELD DRUG TESTING', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('OFFICIAL FIELD AUDIT LOG & TAMPER-EVIDENT SCREENING REPORT', 14, 19);

  // Top right metadata block
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${generatedAt}`, pageWidth - 14, 11, { align: 'right' });
  doc.text(`Total Records Included: ${records.length}`, pageWidth - 14, 15.5, { align: 'right' });
  
  const scopeParts = [];
  if (options?.filterResult && options.filterResult !== 'ALL') {
    scopeParts.push(`Result: ${options.filterResult}`);
  }
  if (options?.dateRangeLabel) {
    scopeParts.push(`Dates: ${options.dateRangeLabel}`);
  }
  if (options?.searchTerm) {
    scopeParts.push(`Search: "${options.searchTerm}"`);
  }
  const scopeStr = scopeParts.length > 0 ? scopeParts.join(' · ') : 'All Results & Dates';
  doc.text(`Filter: ${scopeStr}`, pageWidth - 14, 20, { align: 'right' });

  // 2. Regulatory & Forensic Protocol Notice Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 32, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('LEGAL & EVIDENTIARY STATUTE / MANDATORY OPERATIONAL NOTICE:', 18, 37);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    '“This is a field screening result. Confirmatory laboratory analysis may be required.” All evaluations document colorimetric reactions from certified kits.',
    18,
    42
  );

  // 3. Prepare table rows
  const tableRows = records.map(rec => {
    const formattedDate = new Date(rec.timestamp).toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const truncatedHash = `${rec.sha256Hash.substring(0, 16)}...`;
    const colorComp = `${rec.colorFeatures.compensatedHex} (ΔE:${rec.colorFeatures.deltaEToPositive})`;

    return [
      rec.id,
      formattedDate,
      rec.testKitName.split('(')[0].trim(),
      rec.targetAnalyteClass,
      rec.result,
      `${rec.confidenceScore}%`,
      rec.operatorId,
      rec.location.formattedAddress,
      colorComp,
      truncatedHash,
    ];
  });

  // 4. Build Table using autoTable
  autoTable(doc, {
    startY: 50,
    head: [
      [
        'Test ID',
        'Date / Time',
        'Validated Kit',
        'Analyte Class',
        'Result',
        'Conf.',
        'Operator',
        'GPS Location',
        'Extracted Color',
        'SHA-256 Digest',
      ],
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { font: 'courier', fontStyle: 'bold', cellWidth: 26 }, // Test ID
      1: { cellWidth: 24 }, // Date / Time
      2: { cellWidth: 32 }, // Validated Kit
      3: { cellWidth: 30 }, // Analyte Class
      4: { fontStyle: 'bold', cellWidth: 22, halign: 'center' }, // Result
      5: { cellWidth: 12, halign: 'center' }, // Confidence
      6: { cellWidth: 24 }, // Operator
      7: { cellWidth: 38 }, // GPS Location
      8: { font: 'courier', cellWidth: 26 }, // Extracted Color
      9: { font: 'courier', cellWidth: 34 }, // SHA-256 Digest
    },
    didParseCell: data => {
      // Custom formatting for Result column
      if (data.section === 'body' && data.column.index === 4) {
        const val = String(data.cell.raw);
        if (val === 'POSITIVE') {
          data.cell.styles.textColor = [190, 24, 93]; // Rose-700
          data.cell.styles.fillColor = [255, 241, 242]; // Rose-50
        } else if (val === 'NEGATIVE') {
          data.cell.styles.textColor = [5, 150, 105]; // Emerald-600
          data.cell.styles.fillColor = [236, 253, 245]; // Emerald-50
        } else {
          data.cell.styles.textColor = [217, 119, 6]; // Amber-600
          data.cell.styles.fillColor = [254, 243, 199]; // Amber-50
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 20 },
  });

  // 5. Add Running Footers on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...borderLineColor);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...subtextColor);
    doc.text(
      'CONFIDENTIAL LAW ENFORCEMENT & FORENSIC AUDIT RECORD · VERIFIABLE BY SHA-256 IMAGE DIGEST',
      14,
      pageHeight - 7
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  // Save the PDF
  const filename = `FIELD-TEST-LOG-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Generates an Individual Forensic Case Examination Certificate PDF for a single record,
 * including high-resolution captured evidence and optical colorimetry specs.
 */
export async function exportSingleRecordPdf(record: TestRecord): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top header banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setFillColor(6, 182, 212); // Cyan-500
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('FORENSIC FIELD SCREENING EXAMINATION RECORD', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('CERTIFIED DIGITAL COMPANION FOR FIELD DRUG TESTING', 14, 21);
  doc.text(`RECORD IDENTIFIER: ${record.id}`, 14, 27);

  // Result Badge Card
  const resultColors: Record<string, { bg: [number, number, number]; text: [number, number, number] }> = {
    POSITIVE: { bg: [255, 241, 242], text: [190, 24, 93] },
    NEGATIVE: { bg: [236, 253, 245], text: [5, 150, 105] },
    INCONCLUSIVE: { bg: [254, 243, 199], text: [217, 119, 6] },
  };
  const colorSpec = resultColors[record.result] || resultColors.INCONCLUSIVE;

  doc.setFillColor(...colorSpec.bg);
  doc.setDrawColor(...colorSpec.text);
  doc.roundedRect(14, 38, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...colorSpec.text);
  doc.text(`PRESUMPTIVE RESULT: ${record.result}`, 20, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Confidence Score: ${record.confidenceScore}%  |  Analyte: ${record.targetAnalyteClass}  |  Kit: ${record.testKitName}`,
    20,
    55
  );

  // Details Grid using autoTable
  autoTable(doc, {
    startY: 64,
    head: [['Chain of Custody Attribute', 'Forensic Record Value']],
    body: [
      ['Test Identifier (ID)', record.id],
      ['Operator Badge / Name', record.operatorId],
      ['Date & Time Stamp', new Date(record.timestamp).toLocaleString()],
      ['GPS Location Coordinates', `${record.location.latitude}°, ${record.location.longitude}°`],
      ['Location Description', record.location.formattedAddress],
      ['Validated Chemical Reagent Kit', record.testKitName],
      ['Case / Evidence Reference', record.caseReference || 'N/A (Field Demonstration)'],
      ['Raw Optical Hex', record.colorFeatures.rawHex],
      ['Compensated Optical Hex', `${record.colorFeatures.compensatedHex} (Lighting Normalized)`],
      ['CIE94 Distance (Delta-E)', `ΔE to Pos Target: ${record.colorFeatures.deltaEToPositive}`],
      ['Illumination Assessment', `${record.colorFeatures.illuminationQuality} ILLUMINATION`],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: pageWidth - 28 - 60 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 135;

  // Insert Captured Image if available
  try {
    if (record.capturedImageDataUrl) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('CAPTURED OPTICAL EVIDENCE (DUAL-ZONE FRAME):', 14, finalY + 8);

      const imgWidth = 90;
      const imgHeight = 67.5;
      doc.addImage(record.capturedImageDataUrl, 'JPEG', 14, finalY + 11, imgWidth, imgHeight);

      // Box next to image with SHA-256 seal
      const boxX = 110;
      const boxW = pageWidth - 14 - boxX;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(boxX, finalY + 11, boxW, imgHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('CRYPTOGRAPHIC SEAL', boxX + 6, finalY + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('SHA-256 Image Digest (Hex):', boxX + 6, finalY + 24);

      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      const splitHash = doc.splitTextToSize(record.sha256Hash, boxW - 12);
      doc.text(splitHash, boxX + 6, finalY + 30);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      const legalNote = doc.splitTextToSize(
        'Integrity is verified by hashing raw image bytes. Any bit-level modification breaks verification.',
        boxW - 12
      );
      doc.text(legalNote, boxX + 6, finalY + 48);
    }
  } catch (imgErr) {
    console.warn('Could not embed image into PDF:', imgErr);
  }

  // Footer Disclaimer
  doc.setDrawColor(203, 213, 225);
  doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    '“This is a field screening result. Confirmatory laboratory analysis may be required.”',
    14,
    pageHeight - 13
  );
  doc.text(
    `Sealed at: ${record.timestamp} · Page 1 of 1`,
    pageWidth - 14,
    pageHeight - 13,
    { align: 'right' }
  );

  doc.save(`${record.id}-FORENSIC-REPORT.pdf`);
}
