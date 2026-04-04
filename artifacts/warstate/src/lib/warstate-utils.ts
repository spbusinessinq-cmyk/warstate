import { Theater, TheaterSector } from "@/data/theaters";

export function formatNumber(value: number | string): string {
  return typeof value === "number" ? value.toLocaleString() : value;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface Runtime {
  posture: string;
  confidence: string;
  sectors: TheaterSector[];
  lastUpdated: string;
  currentStatus: string;
}

export interface TrendBar {
  label: string;
  friendly: number;
  opposing: number;
}

export interface ReportSnapshot {
  theater: Theater;
  runtime: Runtime;
  comparisonRows: [string, string, string, string][];
  trendBars: TrendBar[];
  reportText: string;
}

export function buildComparisonRows(theater: Theater): [string, string, string, string][] {
  return [
    ["Total Equipment Losses", formatNumber(theater.friendly.equipmentLosses), formatNumber(theater.opposing.equipmentLosses), "Battle Ledger"],
    ["Tank Losses", formatNumber(theater.friendly.tankLosses), formatNumber(theater.opposing.tankLosses), "Armor Class"],
    ["Armored Vehicle Losses", formatNumber(theater.friendly.armoredLosses), formatNumber(theater.opposing.armoredLosses), "Armor Class"],
    ["Military Casualties", theater.friendly.casualties, theater.opposing.casualties, "Estimate / Mixed"],
    ["Estimated Killed", theater.friendly.killed, theater.opposing.killed, "Estimate / Mixed"],
  ];
}

export function buildTrendBars(theater: Theater): TrendBar[] {
  return [
    {
      label: "Equipment Attrition",
      friendly:
        typeof theater.friendly.equipmentLosses === "number" &&
        typeof theater.opposing.equipmentLosses === "number" &&
        theater.opposing.equipmentLosses > 0
          ? Math.max(5, Math.round((theater.friendly.equipmentLosses / theater.opposing.equipmentLosses) * 100))
          : 0,
      opposing:
        typeof theater.opposing.equipmentLosses === "number" && theater.opposing.equipmentLosses > 0 ? 100 : 0,
    },
    {
      label: "Tank Attrition",
      friendly:
        typeof theater.friendly.tankLosses === "number" &&
        typeof theater.opposing.tankLosses === "number" &&
        theater.opposing.tankLosses > 0
          ? Math.max(5, Math.round((theater.friendly.tankLosses / theater.opposing.tankLosses) * 100))
          : 0,
      opposing:
        typeof theater.opposing.tankLosses === "number" && theater.opposing.tankLosses > 0 ? 100 : 0,
    },
    {
      label: "Armored Attrition",
      friendly:
        typeof theater.friendly.armoredLosses === "number" &&
        typeof theater.opposing.armoredLosses === "number" &&
        theater.opposing.armoredLosses > 0
          ? Math.max(5, Math.round((theater.friendly.armoredLosses / theater.opposing.armoredLosses) * 100))
          : 0,
      opposing:
        typeof theater.opposing.armoredLosses === "number" && theater.opposing.armoredLosses > 0 ? 100 : 0,
    },
  ];
}

export function buildReportText(theater: Theater, runtime: Runtime): string {
  return [
    "CENTRAL INTELLIGENCE-STYLE BATTLEFIELD STATUS REPORT",
    "======================================================",
    "",
    `PRODUCT:           WARSTATE / ${theater.codename}`,
    `THEATER:           ${theater.title}`,
    `DISPLAY NAME:      ${theater.short}`,
    `REGION:            ${theater.region}`,
    `CLASSIFICATION:    ${theater.classification}`,
    `POSTURE:           ${runtime.posture}`,
    `CONFIDENCE:        ${runtime.confidence}`,
    `LAST REFRESH:      ${runtime.lastUpdated}`,
    `SOURCE DISCIPLINE: ${theater.sourceDiscipline}`,
    "",
    "------------------------------------------------------",
    "CURRENT STATUS",
    "------------------------------------------------------",
    runtime.currentStatus,
    "",
    "------------------------------------------------------",
    "EXECUTIVE OVERVIEW",
    "------------------------------------------------------",
    theater.overview,
    "",
    "------------------------------------------------------",
    "ESCALATION DRIVERS",
    "------------------------------------------------------",
    ...theater.escalationDrivers.map((item, idx) => `  ${idx + 1}. ${item}`),
    "",
    "------------------------------------------------------",
    "WATCH NEXT",
    "------------------------------------------------------",
    ...theater.watchNext.map((item, idx) => `  ${idx + 1}. ${item}`),
    "",
    "------------------------------------------------------",
    "FORCE LEDGER",
    "------------------------------------------------------",
    `  ${theater.friendly.label}`,
    `    Equipment losses:  ${formatNumber(theater.friendly.equipmentLosses)}`,
    `    Tank losses:       ${formatNumber(theater.friendly.tankLosses)}`,
    `    Armored losses:    ${formatNumber(theater.friendly.armoredLosses)}`,
    `    Casualties (est.): ${theater.friendly.casualties}`,
    `    KIA (est.):        ${theater.friendly.killed}`,
    "",
    `  ${theater.opposing.label}`,
    `    Equipment losses:  ${formatNumber(theater.opposing.equipmentLosses)}`,
    `    Tank losses:       ${formatNumber(theater.opposing.tankLosses)}`,
    `    Armored losses:    ${formatNumber(theater.opposing.armoredLosses)}`,
    `    Casualties (est.): ${theater.opposing.casualties}`,
    `    KIA (est.):        ${theater.opposing.killed}`,
    "",
    "------------------------------------------------------",
    "PRIORITY INDICATORS",
    "------------------------------------------------------",
    ...theater.indicators.map((item, idx) => `  ${idx + 1}. ${item}`),
    "",
    "------------------------------------------------------",
    "SOURCE STACK",
    "------------------------------------------------------",
    ...theater.sources.map((item, idx) => `  ${idx + 1}. ${item}`),
  ].join("\n");
}

export function downloadFile(filename: string, content: string, type = "text/plain;charset=utf-8"): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to execCommand
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "true");
    area.style.position = "fixed";
    area.style.opacity = "0";
    area.style.pointerEvents = "none";
    document.body.appendChild(area);
    area.focus();
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export function openPrintWindow(title: string, reportText: string): boolean {
  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) return false;

  const escaped = reportText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  printWindow.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title.replace(/</g, "&lt;")}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #ffffff;
      color: #1a1f23;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.6;
      padding: 48px;
    }
    .header {
      border-top: 3px solid #0f5046;
      padding-top: 14px;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 0.04em;
      color: #1a1f23;
      margin-bottom: 6px;
    }
    .header .sub {
      font-size: 9px;
      color: #556068;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .divider {
      border: none;
      border-top: 1px solid #c8ced2;
      margin: 18px 0;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: inherit;
      font-size: 11px;
      line-height: 1.7;
      color: #1a1f23;
    }
    .footer {
      margin-top: 32px;
      padding-top: 10px;
      border-top: 1px solid #c8ced2;
      font-size: 8px;
      color: #8a959e;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    @media print {
      body { padding: 32px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>WARSTATE</h1>
    <div class="sub">Field Status Report &nbsp;//&nbsp; RSR White Wing &nbsp;//&nbsp; Operational Status System</div>
    <div class="sub">${title.replace(/</g, "&lt;")}</div>
  </div>
  <hr class="divider" />
  <pre>${escaped}</pre>
  <div class="footer">Classification: Open Source // Rapid Update &nbsp;&mdash;&nbsp; Generated by WARSTATE Report Core</div>
</body>
</html>`);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
  return true;
}

// ---------------------------------------------------------------------------
// PDF report renderer — called with a lazy-loaded jsPDF instance
// Produces a clean white intelligence brief, multi-page capable
// ---------------------------------------------------------------------------
export function renderPDFReport(doc: any, source: ReportSnapshot): void {
  const ML = 48; // margin left
  const MR = 48; // margin right
  const MT = 48; // margin top
  const MB = 48; // margin bottom
  const PW = 612; // letter width pts
  const PH = 792; // letter height pts
  const CW = PW - ML - MR; // content width = 516
  const BOTTOM = PH - MB; // lowest y before new page = 744

  let y = MT;

  // --- Helpers ---

  function newPageFill() {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, PW, PH, "F");
  }

  function checkPage(needed = 60) {
    if (y + needed > BOTTOM) {
      doc.addPage();
      newPageFill();
      y = MT;
    }
  }

  function sectionGap(px = 20) {
    y += px;
  }

  function sectionHeader(label: string) {
    sectionGap(8);
    checkPage(55);
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 80, 70);
    doc.text(label.toUpperCase(), ML, y);
    y += 5;
    doc.setDrawColor(200, 208, 212);
    doc.setLineWidth(0.5);
    doc.line(ML, y, ML + CW, y);
    y += 12;
  }

  function bodyText(text: string, lineHeight = 13) {
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(26, 31, 35);
    const lines: string[] = doc.splitTextToSize(text, CW);
    for (const line of lines) {
      checkPage(lineHeight + 4);
      doc.text(line, ML, y);
      y += lineHeight;
    }
  }

  function labelText(text: string) {
    doc.setFont("courier", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(85, 98, 106);
    doc.text(text.toUpperCase(), ML, y);
    y += 11;
  }

  // --- Page 1: white background ---
  newPageFill();

  // === Title block ===
  doc.setDrawColor(15, 80, 70);
  doc.setLineWidth(2.5);
  doc.line(ML, y, ML + CW, y);
  y += 16;

  doc.setFont("courier", "bold");
  doc.setFontSize(20);
  doc.setTextColor(26, 31, 35);
  doc.text("WARSTATE", ML, y);
  y += 24;

  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(85, 98, 106);
  doc.text("FIELD STATUS REPORT  //  RSR WHITE WING  //  OPERATIONAL STATUS SYSTEM", ML, y);
  y += 13;
  doc.text(`${source.theater.title.toUpperCase()}  //  GENERATED: ${source.runtime.lastUpdated}`, ML, y);
  y += 18;

  doc.setDrawColor(200, 208, 212);
  doc.setLineWidth(0.5);
  doc.line(ML, y, ML + CW, y);
  y += 18;

  // === Summary row (4 cells) ===
  const boxW = CW / 4;
  const boxH = 40;
  const summaryItems = [
    { label: "THEATER", value: source.theater.short },
    { label: "POSTURE", value: source.runtime.posture },
    { label: "CONFIDENCE", value: source.runtime.confidence },
    { label: "CLASSIFICATION", value: source.theater.classification },
  ];
  summaryItems.forEach((item, i) => {
    const bx = ML + i * boxW;
    doc.setFillColor(244, 247, 249);
    doc.setDrawColor(200, 208, 212);
    doc.setLineWidth(0.5);
    doc.rect(bx, y, boxW, boxH, "FD");
    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(85, 98, 106);
    doc.text(item.label, bx + 6, y + 11);
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(26, 31, 35);
    const valStr = doc.splitTextToSize(item.value, boxW - 14)[0] || item.value;
    doc.text(valStr, bx + 6, y + 27);
  });
  y += boxH + 22;

  // === Current Status ===
  sectionHeader("Current Status");
  bodyText(source.runtime.currentStatus);

  // === Executive Overview ===
  sectionHeader("Executive Overview");
  bodyText(source.theater.overview);

  // === Escalation Drivers ===
  sectionHeader("Escalation Drivers");
  source.theater.escalationDrivers.forEach((item, idx) => {
    const lines: string[] = doc.splitTextToSize(`${idx + 1}.  ${item}`, CW - 6);
    lines.forEach((line: string, li: number) => {
      checkPage(14);
      doc.setFont("courier", li === 0 ? "bold" : "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(26, 31, 35);
      doc.text(line, ML, y);
      y += 13;
    });
    y += 3;
  });

  // === Watch Next ===
  sectionHeader("Watch Next");
  source.theater.watchNext.forEach((item, idx) => {
    const lines: string[] = doc.splitTextToSize(`${idx + 1}.  ${item}`, CW - 6);
    lines.forEach((line: string, li: number) => {
      checkPage(14);
      doc.setFont("courier", li === 0 ? "bold" : "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(26, 31, 35);
      doc.text(line, ML, y);
      y += 13;
    });
    y += 3;
  });

  // === Force Ledger ===
  sectionHeader("Force Ledger");
  const col0 = ML;
  const col1 = ML + Math.round(CW * 0.38);
  const col2 = ML + Math.round(CW * 0.67);

  // Header
  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(85, 98, 106);
  doc.text("METRIC", col0, y);
  doc.text(source.theater.friendly.label.toUpperCase().slice(0, 22), col1, y);
  doc.text(source.theater.opposing.label.toUpperCase().slice(0, 22), col2, y);
  y += 5;
  doc.setDrawColor(200, 208, 212);
  doc.setLineWidth(0.3);
  doc.line(ML, y, ML + CW, y);
  y += 10;

  const ledgerData: [string, string, string][] = [
    ["Equipment Losses", formatNumber(source.theater.friendly.equipmentLosses), formatNumber(source.theater.opposing.equipmentLosses)],
    ["Tank Losses", formatNumber(source.theater.friendly.tankLosses), formatNumber(source.theater.opposing.tankLosses)],
    ["Armored Losses", formatNumber(source.theater.friendly.armoredLosses), formatNumber(source.theater.opposing.armoredLosses)],
    ["Casualties (Est.)", source.theater.friendly.casualties, source.theater.opposing.casualties],
    ["KIA (Est.)", source.theater.friendly.killed, source.theater.opposing.killed],
  ];

  ledgerData.forEach((row, ri) => {
    checkPage(16);
    if (ri % 2 === 0) {
      doc.setFillColor(249, 251, 252);
      doc.rect(ML, y - 9, CW, 13, "F");
    }
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(26, 31, 35);
    doc.text(row[0], col0, y);
    doc.text(String(row[1]), col1, y);
    doc.text(String(row[2]), col2, y);
    y += 14;
  });

  // === Priority Indicators ===
  sectionHeader("Priority Indicators");
  source.theater.indicators.forEach((item, idx) => {
    const lines: string[] = doc.splitTextToSize(`${idx + 1}.  ${item}`, CW - 6);
    lines.forEach((line: string, li: number) => {
      checkPage(14);
      doc.setFont("courier", li === 0 ? "bold" : "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(26, 31, 35);
      doc.text(line, ML, y);
      y += 13;
    });
  });

  // === Source Stack ===
  sectionHeader("Source Stack");
  source.theater.sources.forEach((item, idx) => {
    checkPage(14);
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(26, 31, 35);
    const lines: string[] = doc.splitTextToSize(`${idx + 1}.  ${item}`, CW - 6);
    lines.forEach((line: string) => {
      checkPage(14);
      doc.text(line, ML, y);
      y += 13;
    });
  });

  // === Sector Stress Index ===
  sectionHeader("Sector Stress Index");
  source.runtime.sectors.forEach((sector) => {
    checkPage(32);
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(26, 31, 35);
    doc.text(sector.name, ML, y);
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(85, 98, 106);
    const valStr = `${sector.value}/100`;
    doc.text(valStr, ML + CW - doc.getTextWidth(valStr), y);
    y += 7;
    // bar track
    doc.setFillColor(229, 236, 240);
    doc.setDrawColor(200, 208, 212);
    doc.setLineWidth(0.3);
    doc.rect(ML, y, CW, 10, "FD");
    // bar fill
    const fillW = Math.max(0, Math.min(CW, (sector.value / 100) * CW));
    if (fillW > 0) {
      doc.setFillColor(15, 80, 70);
      doc.rect(ML, y, fillW, 10, "F");
    }
    y += 20;
  });

  // === Relative Attrition ===
  sectionHeader("Relative Attrition");
  source.trendBars.forEach((bar) => {
    checkPage(65);
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(26, 31, 35);
    doc.text(bar.label.toUpperCase(), ML, y);
    y += 14;

    // Friendly
    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(85, 98, 106);
    doc.text(`${source.theater.friendly.label}  (${bar.friendly}%)`, ML, y);
    y += 5;
    doc.setFillColor(229, 236, 240);
    doc.setDrawColor(200, 208, 212);
    doc.setLineWidth(0.3);
    doc.rect(ML, y, CW, 10, "FD");
    const fw = Math.max(0, Math.min(CW, (bar.friendly / 100) * CW));
    if (fw > 0) {
      doc.setFillColor(15, 80, 70);
      doc.rect(ML, y, fw, 10, "F");
    }
    y += 15;

    // Opposing
    doc.setTextColor(85, 98, 106);
    doc.text(`${source.theater.opposing.label}  (${bar.opposing}%)`, ML, y);
    y += 5;
    doc.setFillColor(229, 236, 240);
    doc.setDrawColor(200, 208, 212);
    doc.setLineWidth(0.3);
    doc.rect(ML, y, CW, 10, "FD");
    const ow = Math.max(0, Math.min(CW, (bar.opposing / 100) * CW));
    if (ow > 0) {
      doc.setFillColor(108, 124, 134);
      doc.rect(ML, y, ow, 10, "F");
    }
    y += 22;
  });

  // === Footer on every page ===
  const totalPages: number = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 162, 170);
    const left = `WARSTATE  //  ${source.theater.title.toUpperCase()}  //  PAGE ${p} OF ${totalPages}`;
    const right = `CLASSIFICATION: ${source.theater.classification.toUpperCase()}`;
    doc.text(left, ML, PH - 24);
    doc.text(right, ML + CW - doc.getTextWidth(right), PH - 24);
    doc.setDrawColor(200, 208, 212);
    doc.setLineWidth(0.3);
    doc.line(ML, PH - 32, ML + CW, PH - 32);
  }
}
