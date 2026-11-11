import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PatientProfile, MedicationDefinition, Regimen, VaccinationRecord } from '../types';

export interface GeneratePdfOptions {
  patient: PatientProfile;
  medications: MedicationDefinition[];
  regimens: Regimen[];
  vaccinations?: VaccinationRecord[];
}

export function generateMedicationListPDF({
  patient,
  medications,
  regimens,
  vaccinations = [],
}: GeneratePdfOptions): void {
  // Create document in standard portrait A4 format
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Header Bar (Brand banner)
  doc.setFillColor(225, 29, 72); // CareNest Coral Rose #e11d48
  doc.rect(margin, currentY, contentWidth, 5, 'F');
  currentY += 22;

  // Title & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('CareNest · Medication Reconciliation Summary', margin, currentY);

  currentY += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  const dateStr = new Date().toLocaleString();
  doc.text(`Official Patient Health Record · Generated: ${dateStr}`, margin, currentY);
  currentY += 16;

  // Patient Info Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, contentWidth, 54, 4, 4, 'FD');

  const infoY = currentY + 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Patient: ${patient.name} (${patient.preferredName})`, margin + 12, infoY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`DOB / Birth Date: ${patient.birthDate || 'Unspecified'}`, margin + 12, infoY + 14);
  doc.text(`Gender: ${patient.gender}`, margin + 12, infoY + 26);

  // Right column inside patient box: Allergies
  const rightColX = margin + contentWidth / 2;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(159, 18, 57); // rose-800
  doc.text('Documented Drug Allergies:', rightColX, infoY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const allergiesText = patient.allergies && patient.allergies.length > 0
    ? patient.allergies.join(', ')
    : 'No Known Drug Allergies (NKDA)';
  const wrappedAllergies = doc.splitTextToSize(allergiesText, contentWidth / 2 - 16);
  doc.text(wrappedAllergies, rightColX, infoY + 14);

  currentY += 66;

  // Active Medications Section
  const regimenMap = new Map(regimens.map((r) => [r.medicationId, r]));
  const activeMeds = medications.filter((m) => m.status === 'active');
  const pastMeds = medications.filter((m) => m.status !== 'active');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`1. Active Medications & Regimens (${activeMeds.length})`, margin, currentY);
  currentY += 8;

  const activeTableBody = activeMeds.map((med) => {
    const reg = regimenMap.get(med.id);
    const scheduleStr = reg?.frequencyType === 'prn'
      ? `PRN / As Needed (${reg.prnMaxPerDay || 'As directed'})`
      : (reg?.scheduleEntries || [])
          .map((s) => `${s.doseQuantity} ${s.doseUnit} @ ${s.localTime} (${s.label || 'Scheduled'})`)
          .join('\n');

    const medTitle = med.brandName
      ? `${med.medicationName}\n[Brand: ${med.brandName}]`
      : med.medicationName;

    return [
      medTitle,
      `${med.strengthValue} ${med.strengthUnit}\n${med.form} (${med.route})`,
      scheduleStr || 'Standard dose',
      med.reasonForUse || 'Unspecified',
      med.startDate || 'Ongoing',
      med.prescribedBy || 'Self / Primary Clinician',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Medication Name', 'Strength / Form', 'Dosage & Schedule', 'Indication / Reason', 'Start Date', 'Prescriber']],
    body: activeTableBody.length > 0 ? activeTableBody : [['No active medications recorded', '-', '-', '-', '-', '-']],
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [225, 29, 72], // Coral Rose
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [254, 242, 242], // very light rose-50
    },
    columnStyles: {
      0: { cellWidth: 110, fontStyle: 'bold' },
      1: { cellWidth: 90 },
      2: { cellWidth: 140 },
      3: { cellWidth: 85 },
      4: { cellWidth: 50 },
      5: { cellWidth: 50 },
    },
  });

  // Calculate position after first table
  const docAny = doc as unknown as { lastAutoTable?: { finalY: number } };
  currentY = (docAny.lastAutoTable ? docAny.lastAutoTable.finalY : currentY + 120) + 18;

  // Past / Discontinued Medications (if any)
  if (pastMeds.length > 0) {
    // Check if we need a new page
    if (currentY > pageHeight - 140) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`2. Discontinued / Past Medications (${pastMeds.length})`, margin, currentY);
    currentY += 8;

    const pastTableBody = pastMeds.map((med) => [
      med.brandName ? `${med.medicationName} (${med.brandName})` : med.medicationName,
      `${med.strengthValue} ${med.strengthUnit}`,
      med.reasonForUse || 'N/A',
      `Started: ${med.startDate}\nStopped: ${med.endDate || 'Discontinued'}`,
      med.instructionsLabel || 'Standard past regimen',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Medication', 'Strength', 'Indication', 'Timeline', 'Past Instructions']],
      body: pastTableBody,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: [100, 116, 139], // slate-500
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 120, fontStyle: 'bold' },
        1: { cellWidth: 70 },
        2: { cellWidth: 110 },
        3: { cellWidth: 95 },
        4: { cellWidth: 130 },
      },
    });

    currentY = (docAny.lastAutoTable ? docAny.lastAutoTable.finalY : currentY + 80) + 18;
  }

  // Immunization History (if available)
  if (vaccinations && vaccinations.length > 0) {
    if (currentY > pageHeight - 120) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`3. Immunization & Vaccination History (${vaccinations.length})`, margin, currentY);
    currentY += 8;

    const vaccineBody = vaccinations.map((v) => [
      v.vaccineName,
      v.dateAdministered,
      v.administeredAt || 'Clinic',
      v.lotNumber || 'N/A',
      v.sideEffectsNotes || 'None documented',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Vaccine Name', 'Date Administered', 'Clinic / Location', 'Lot #', 'Documented Reactions / Notes']],
      body: vaccineBody,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
        cellPadding: 4,
      },
    });

    currentY = (docAny.lastAutoTable ? docAny.lastAutoTable.finalY : currentY + 80) + 14;
  }

  // Clinical Safety Footer
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = margin;
  }

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  const notice = 'Clinical Notice: This document is generated for personal medication tracking and physician reconciliation. Always verify all drug strengths, dosages, and interactions with the prescribing clinician or pharmacist before administration.';
  const wrappedNotice = doc.splitTextToSize(notice, contentWidth);
  doc.text(wrappedNotice, margin, currentY);

  currentY += 16;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CareNest · Developed by Designs2Love Version 1.0 · https://carenest.health', margin, currentY);

  // Trigger instant PDF download in browser
  const sanitizedName = patient.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const dateStamp = new Date().toISOString().split('T')[0];
  const fileName = `carenest-medications-${sanitizedName}-${dateStamp}.pdf`;

  doc.save(fileName);
}
