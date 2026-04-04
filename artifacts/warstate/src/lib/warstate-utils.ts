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
  const pad = (label: string, value: string, w = 20) =>
    `${label.padEnd(w)}: ${value}`;

  return [
    "WARSTATE — FIELD STATUS REPORT",
    "==============================================================",
    "",
    pad("PRODUCT", `WARSTATE / ${theater.codename}`),
    pad("THEATER", theater.title),
    pad("DISPLAY NAME", theater.short),
    pad("REGION", theater.region),
    pad("CLASSIFICATION", theater.classification),
    pad("POSTURE", runtime.posture),
    pad("CONFIDENCE", runtime.confidence),
    pad("LAST REFRESH", runtime.lastUpdated),
    pad("SOURCE DISCIPLINE", theater.sourceDiscipline),
    "",
    "--------------------------------------------------------------",
    "CURRENT STATUS",
    "--------------------------------------------------------------",
    runtime.currentStatus,
    "",
    "--------------------------------------------------------------",
    "EXECUTIVE OVERVIEW",
    "--------------------------------------------------------------",
    theater.overview,
    "",
    "--------------------------------------------------------------",
    "ESCALATION DRIVERS",
    "--------------------------------------------------------------",
    ...theater.escalationDrivers.map((item, idx) => `  ${idx + 1}. ${item}`),
    "",
    "--------------------------------------------------------------",
    "WATCH NEXT",
    "--------------------------------------------------------------",
    ...theater.watchNext.map((item, idx) => `  ${idx + 1}. ${item}`),
    "",
    "--------------------------------------------------------------",
    "FORCE LEDGER",
    "--------------------------------------------------------------",
    "",
    `  ${theater.friendly.label.toUpperCase()}`,
    `    Equipment losses : ${formatNumber(theater.friendly.equipmentLosses)}`,
    `    Tank losses      : ${formatNumber(theater.friendly.tankLosses)}`,
    `    Armored losses   : ${formatNumber(theater.friendly.armoredLosses)}`,
    `    Casualties (est) : ${theater.friendly.casualties}`,
    `    KIA (est)        : ${theater.friendly.killed}`,
    "",
    `  ${theater.opposing.label.toUpperCase()}`,
    `    Equipment losses : ${formatNumber(theater.opposing.equipmentLosses)}`,
    `    Tank losses      : ${formatNumber(theater.opposing.tankLosses)}`,
    `    Armored losses   : ${formatNumber(theater.opposing.armoredLosses)}`,
    `    Casualties (est) : ${theater.opposing.casualties}`,
    `    KIA (est)        : ${theater.opposing.killed}`,
    "",
    "--------------------------------------------------------------",
    "PRIORITY INDICATORS",
    "--------------------------------------------------------------",
    ...theater.indicators.map((item, idx) => `  ${idx + 1}. ${item}`),
    "",
    "--------------------------------------------------------------",
    "SOURCE STACK",
    "--------------------------------------------------------------",
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
  const printWindow = window.open("", "_blank", "width=960,height=1100");
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
      line-height: 1.65;
      padding: 52px 56px;
      max-width: 860px;
      margin: 0 auto;
    }
    .header {
      border-top: 3px solid #0f5046;
      padding-top: 16px;
      margin-bottom: 28px;
    }
    .header h1 {
      font-size: 22px;
      font-weight: bold;
      letter-spacing: 0.04em;
      color: #1a1f23;
      margin-bottom: 8px;
    }
    .header .sub {
      font-size: 9px;
      color: #556068;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    hr { border: none; border-top: 1px solid #c8ced2; margin: 20px 0; }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-word;
      font-family: inherit;
      font-size: 11px;
      line-height: 1.75;
      color: #1a1f23;
    }
    .footer {
      margin-top: 36px;
      padding-top: 10px;
      border-top: 1px solid #c8ced2;
      font-size: 8px;
      color: #8a959e;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    @media print {
      body { padding: 36px 40px; }
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
  <hr />
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
// PDF report renderer — rebuilt with proper layout engine
// Uses dynamic row heights, column-constrained wrapping, clean page breaks
// ---------------------------------------------------------------------------
export function renderPDFReport(doc: any, source: ReportSnapshot): void {
  // Page constants
  const ML = 50;    // margin left
  const MR = 50;    // margin right
  const MT = 50;    // margin top
  const MB = 56;    // margin bottom (leaves room for footer)
  const PW = 612;   // letter width pts
  const PH = 792;   // letter height pts
  const CW = PW - ML - MR;   // content width = 512
  const BOTTOM = PH - MB;    // max y before footer zone = 736

  // Column widths for 3-col ledger table
  const C0W = 162;            // metric label column
  const C1W = Math.floor((CW - C0W) / 2);  // friendly column
  const C2W = CW - C0W - C1W;              // opposing column
  const C0X = ML;
  const C1X = ML + C0W;
  const C2X = ML + C0W + C1W;

  // Colors (r,g,b)
  const COL_DARK   = [26, 31, 35] as [number,number,number];
  const COL_MUTED  = [85, 98, 106] as [number,number,number];
  const COL_RULE   = [200, 208, 212] as [number,number,number];
  const COL_GREEN  = [15, 80, 70] as [number,number,number];
  const COL_FILL_A = [246, 249, 251] as [number,number,number];
  const COL_FILL_B = [255, 255, 255] as [number,number,number];
  const COL_FILL_BAR_TRACK = [225, 232, 236] as [number,number,number];
  const COL_FILL_BAR_OPP   = [108, 124, 134] as [number,number,number];

  let y = MT;

  // ── Core helpers ──────────────────────────────────────────────────────────

  function whitePageFill() {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, PW, PH, "F");
  }

  // Checks if we have `needed` pts before bottom; adds new page if not.
  function checkPage(needed: number) {
    if (y + needed > BOTTOM) {
      doc.addPage();
      whitePageFill();
      y = MT;
    }
  }

  // Wrapped text block — returns final y after all lines rendered.
  // Does NOT advance y; caller must update y.
  function wrappedLines(text: string, maxW: number): string[] {
    return doc.splitTextToSize(text, maxW) as string[];
  }

  // Render a paragraph with automatic page-breaking per line
  function paragraph(text: string, {
    font = "normal" as string,
    size = 9 as number,
    color = COL_DARK as [number,number,number],
    lineH = 13 as number,
    indent = 0 as number,
    colW = CW as number,
  } = {}) {
    doc.setFont("courier", font);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = wrappedLines(text, colW - indent);
    for (const line of lines) {
      checkPage(lineH + 2);
      doc.text(line, ML + indent, y);
      y += lineH;
    }
  }

  // Numbered item with bold first line and wrapped continuation
  function numberedItem(idx: number, text: string, {
    indent = 12 as number,
    size = 8.5 as number,
    lineH = 13 as number,
    gap = 4 as number,
  } = {}) {
    const prefix = `${idx + 1}.`;
    const prefixW = doc.getTextWidth(prefix) + 6;
    const textColW = CW - indent - prefixW;
    const lines = wrappedLines(text, textColW);
    const totalH = lines.length * lineH + gap;
    checkPage(totalH);

    doc.setFont("courier", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...COL_MUTED);
    doc.text(prefix, ML + indent, y);

    lines.forEach((line: string, li: number) => {
      doc.setFont("courier", li === 0 ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...COL_DARK);
      doc.text(line, ML + indent + prefixW, y);
      y += lineH;
    });
    y += gap;
  }

  // Section header with rule
  function sectionHeader(label: string, gapBefore = 22) {
    y += gapBefore;
    checkPage(50);
    doc.setFont("courier", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COL_GREEN);
    doc.text(label.toUpperCase(), ML, y);
    y += 6;
    doc.setDrawColor(...COL_RULE);
    doc.setLineWidth(0.4);
    doc.line(ML, y, ML + CW, y);
    y += 12;
  }

  // Thin horizontal rule
  function rule(gapV = 0) {
    if (gapV) y += gapV;
    doc.setDrawColor(...COL_RULE);
    doc.setLineWidth(0.3);
    doc.line(ML, y, ML + CW, y);
    if (gapV) y += gapV;
  }

  // ── Force Ledger Table Helper ─────────────────────────────────────────────
  // Renders a single ledger row with proper wrapped columns and dynamic height.
  function ledgerRow(
    col0: string, col1: string, col2: string,
    isHeader: boolean, isShaded: boolean
  ) {
    const VPAD = 6;   // vertical padding top/bottom
    const HPAD = 6;   // horizontal padding inside cell

    // Set font sizes for line-count calculation
    const fSize = isHeader ? 7.5 : 8.5;
    doc.setFontSize(fSize);
    doc.setFont("courier", isHeader ? "bold" : "normal");

    // Wrap each column's text
    const c0Lines = wrappedLines(col0, C0W - HPAD * 2);
    const c1Lines = wrappedLines(col1, C1W - HPAD * 2);
    const c2Lines = wrappedLines(col2, C2W - HPAD * 2);
    const maxLines = Math.max(c0Lines.length, c1Lines.length, c2Lines.length, 1);
    const lineH = isHeader ? 11 : 12;
    const rowH = maxLines * lineH + VPAD * 2;

    checkPage(rowH + 2);

    // Row background
    if (isShaded) {
      doc.setFillColor(...COL_FILL_A);
      doc.rect(ML, y, CW, rowH, "F");
    } else if (!isHeader) {
      doc.setFillColor(...COL_FILL_B);
      doc.rect(ML, y, CW, rowH, "F");
    }

    // Column dividers
    doc.setDrawColor(...COL_RULE);
    doc.setLineWidth(0.3);
    doc.line(ML, y, ML + CW, y);
    if (isHeader) {
      doc.line(ML, y + rowH, ML + CW, y + rowH);
    }
    doc.line(C1X, y, C1X, y + rowH);
    doc.line(C2X, y, C2X, y + rowH);

    const textY = y + VPAD + (isHeader ? 8 : 9);

    // col0
    const c0Color = isHeader ? COL_MUTED : COL_DARK;
    doc.setFont("courier", isHeader ? "bold" : "normal");
    doc.setFontSize(fSize);
    doc.setTextColor(...c0Color);
    c0Lines.forEach((line: string, li: number) => {
      doc.text(line, C0X + HPAD, textY + li * lineH);
    });

    // col1
    const c1Color = isHeader ? COL_MUTED : COL_DARK;
    doc.setFont("courier", isHeader ? "bold" : "normal");
    doc.setTextColor(...c1Color);
    c1Lines.forEach((line: string, li: number) => {
      doc.text(line, C1X + HPAD, textY + li * lineH);
    });

    // col2
    const c2Color = isHeader ? COL_MUTED : COL_DARK;
    doc.setFont("courier", isHeader ? "bold" : "normal");
    doc.setTextColor(...c2Color);
    c2Lines.forEach((line: string, li: number) => {
      doc.text(line, C2X + HPAD, textY + li * lineH);
    });

    y += rowH;
  }

  // ── Bar chart helper ───────────────────────────────────────────────────────
  function barRow(label: string, pct: number, color: [number,number,number]) {
    const barH = 9;
    const needed = 7 + 5 + barH + 4;
    checkPage(needed);
    doc.setFont("courier", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COL_MUTED);
    doc.text(label, ML, y);
    const pctStr = `${pct}%`;
    doc.setTextColor(...COL_DARK);
    doc.text(pctStr, ML + CW - doc.getTextWidth(pctStr), y);
    y += 5;
    // Track
    doc.setFillColor(...COL_FILL_BAR_TRACK);
    doc.setDrawColor(...COL_RULE);
    doc.setLineWidth(0.3);
    doc.rect(ML, y, CW, barH, "FD");
    // Fill
    const fw = Math.max(0, Math.min(CW, (pct / 100) * CW));
    if (fw > 0) {
      doc.setFillColor(...color);
      doc.rect(ML, y, fw, barH, "F");
    }
    y += barH + 4;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BEGIN DOCUMENT
  // ─────────────────────────────────────────────────────────────────────────
  whitePageFill();

  // ── Title block ──────────────────────────────────────────────────────────
  doc.setDrawColor(...COL_GREEN);
  doc.setLineWidth(2.5);
  doc.line(ML, y, ML + CW, y);
  y += 18;

  doc.setFont("courier", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...COL_DARK);
  doc.text("WARSTATE", ML, y);
  y += 26;

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COL_MUTED);
  const subLine1 = "FIELD STATUS REPORT  //  RSR WHITE WING  //  OPERATIONAL STATUS SYSTEM";
  doc.text(subLine1, ML, y);
  y += 12;

  const theatLineRaw = `${source.theater.title.toUpperCase()}  //  GENERATED: ${source.runtime.lastUpdated}`;
  const theatLine = doc.splitTextToSize(theatLineRaw, CW)[0];
  doc.text(theatLine, ML, y);
  y += 18;

  rule();
  y += 16;

  // ── Summary metadata cells (4 cells) ─────────────────────────────────────
  const cellW = Math.floor(CW / 4);
  const cellH = 44;
  const summaryMeta = [
    { label: "THEATER",        value: source.theater.short },
    { label: "POSTURE",        value: source.runtime.posture },
    { label: "CONFIDENCE",     value: source.runtime.confidence },
    { label: "CLASSIFICATION", value: source.theater.classification },
  ];

  summaryMeta.forEach((item, i) => {
    const bx = ML + i * cellW;
    const bw = i === summaryMeta.length - 1 ? CW - i * cellW : cellW; // last cell fills to edge
    doc.setFillColor(...COL_FILL_A);
    doc.setDrawColor(...COL_RULE);
    doc.setLineWidth(0.4);
    doc.rect(bx, y, bw, cellH, "FD");
    // Label
    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...COL_MUTED);
    doc.text(item.label, bx + 7, y + 13);
    // Value — wrap within cell
    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...COL_DARK);
    const valLines = doc.splitTextToSize(item.value, bw - 14) as string[];
    valLines.slice(0, 2).forEach((line: string, li: number) => {
      doc.text(line, bx + 7, y + 26 + li * 11);
    });
  });
  y += cellH + 24;

  // ── 1. Current Status ─────────────────────────────────────────────────────
  sectionHeader("1.  Current Status");
  paragraph(source.runtime.currentStatus, { size: 9, lineH: 13 });

  // ── 2. Executive Overview ─────────────────────────────────────────────────
  sectionHeader("2.  Executive Overview");
  paragraph(source.theater.overview, { size: 9, lineH: 13 });

  // ── 3. Escalation Drivers ─────────────────────────────────────────────────
  sectionHeader("3.  Escalation Drivers");
  source.theater.escalationDrivers.forEach((item, idx) => {
    numberedItem(idx, item, { indent: 8, size: 8.5, lineH: 13, gap: 5 });
  });

  // ── 4. Watch Next ─────────────────────────────────────────────────────────
  sectionHeader("4.  Watch Next");
  source.theater.watchNext.forEach((item, idx) => {
    numberedItem(idx, item, { indent: 8, size: 8.5, lineH: 13, gap: 5 });
  });

  // ── 5. Force Ledger ───────────────────────────────────────────────────────
  sectionHeader("5.  Force Ledger");

  // Ledger table header
  ledgerRow(
    "METRIC",
    source.theater.friendly.label.toUpperCase(),
    source.theater.opposing.label.toUpperCase(),
    true, false
  );

  // Ledger rows
  const ledgerRows: [string, string, string][] = [
    ["Total Equipment Losses", formatNumber(source.theater.friendly.equipmentLosses), formatNumber(source.theater.opposing.equipmentLosses)],
    ["Tank Losses",            formatNumber(source.theater.friendly.tankLosses),       formatNumber(source.theater.opposing.tankLosses)],
    ["Armored Vehicle Losses", formatNumber(source.theater.friendly.armoredLosses),    formatNumber(source.theater.opposing.armoredLosses)],
    ["Casualties (Est.)",      source.theater.friendly.casualties,                     source.theater.opposing.casualties],
    ["KIA (Est.)",             source.theater.friendly.killed,                         source.theater.opposing.killed],
  ];
  ledgerRows.forEach((row, ri) => {
    ledgerRow(row[0], row[1], row[2], false, ri % 2 === 0);
  });

  // Bottom ledger rule
  doc.setDrawColor(...COL_RULE);
  doc.setLineWidth(0.4);
  doc.line(ML, y, ML + CW, y);
  y += 6;

  // ── 6. Priority Indicators ────────────────────────────────────────────────
  sectionHeader("6.  Priority Indicators");
  source.theater.indicators.forEach((item, idx) => {
    // Parse category prefix if present
    const ci = item.indexOf(":");
    const hasCategory = ci > 0 && ci < 55;
    const displayText = hasCategory
      ? `[${item.slice(0, ci).trim().toUpperCase()}]  ${item.slice(ci + 1).trim()}`
      : item;
    numberedItem(idx, displayText, { indent: 8, size: 8.5, lineH: 12.5, gap: 4 });
  });

  // ── 7. Source Stack ────────────────────────────────────────────────────────
  sectionHeader("7.  Source Stack");
  source.theater.sources.forEach((item, idx) => {
    const ci = item.indexOf(":");
    const hasCategory = ci > 0 && ci < 50;
    const displayText = hasCategory
      ? `[${item.slice(0, ci).trim().toUpperCase()}]  ${item.slice(ci + 1).trim()}`
      : item;
    numberedItem(idx, displayText, { indent: 8, size: 8.5, lineH: 12.5, gap: 4 });
  });

  // ── 8. Sector Stress Index ────────────────────────────────────────────────
  sectionHeader("8.  Sector Stress Index");
  source.runtime.sectors.forEach((sector) => {
    checkPage(42);
    // Label row
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COL_DARK);
    doc.text(sector.name, ML, y);
    const valStr = `${sector.value} / 100`;
    doc.setFont("courier", "normal");
    doc.setTextColor(...COL_MUTED);
    doc.text(valStr, ML + CW - doc.getTextWidth(valStr), y);
    y += 6;
    // Bar
    const barH = 10;
    doc.setFillColor(...COL_FILL_BAR_TRACK);
    doc.setDrawColor(...COL_RULE);
    doc.setLineWidth(0.3);
    doc.rect(ML, y, CW, barH, "FD");
    const fw = Math.max(0, Math.min(CW, (sector.value / 100) * CW));
    if (fw > 0) {
      doc.setFillColor(...COL_GREEN);
      doc.rect(ML, y, fw, barH, "F");
    }
    y += barH + 10;
  });

  // ── 9. Relative Attrition ─────────────────────────────────────────────────
  sectionHeader("9.  Relative Attrition");
  source.trendBars.forEach((bar) => {
    const needed = 16 + 5 + 9 + 5 + 9 + 16 + 14;
    checkPage(needed);

    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COL_DARK);
    doc.text(bar.label.toUpperCase(), ML, y);
    y += 14;

    barRow(
      `${source.theater.friendly.label}`,
      bar.friendly,
      COL_GREEN
    );
    barRow(
      `${source.theater.opposing.label}`,
      bar.opposing,
      COL_FILL_BAR_OPP
    );

    y += 6;  // inter-group gap
  });

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages: number = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Footer rule
    doc.setDrawColor(...COL_RULE);
    doc.setLineWidth(0.3);
    doc.line(ML, PH - 36, ML + CW, PH - 36);

    // Footer text
    doc.setFont("courier", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(150, 162, 170);
    const footLeft = `WARSTATE  //  ${source.theater.title.toUpperCase()}  //  PAGE ${p} OF ${totalPages}`;
    const footRight = `CLASSIFICATION: ${source.theater.classification}`;
    doc.text(footLeft, ML, PH - 26);
    // Right-align footRight
    const rw = doc.getTextWidth(footRight);
    doc.text(footRight, ML + CW - rw, PH - 26);
  }
}
