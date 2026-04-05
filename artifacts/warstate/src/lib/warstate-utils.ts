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

export type ReportMode = "executive" | "analyst" | "escalation" | "daily";

export const REPORT_MODE_LABELS: Record<ReportMode, string> = {
  executive:  "Executive Brief",
  analyst:    "Analyst Brief",
  escalation: "Escalation Memo",
  daily:      "Daily Theater Update",
};

export interface SourcePosture {
  breadth: "NARROW" | "MODERATE" | "BROAD";
  categories: string[];
  strength: "LOW" | "MODERATE" | "HIGH";
  contradictionRisk: boolean;
  summary: string;
}

export interface ReportSnapshot {
  theater: Theater;
  runtime: Runtime;
  comparisonRows: [string, string, string, string][];
  trendBars: TrendBar[];
  reportText: string;
  mode: ReportMode;
  sourcePosture: SourcePosture;
  previousReport?: ReportSnapshot | null;
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

export function buildReportText(
  theater: Theater,
  runtime: Runtime,
  mode: ReportMode = "analyst",
  previousReport?: ReportSnapshot | null,
  sp?: SourcePosture,
): string {
  const pad = (label: string, value: string, w = 22) =>
    `${label.padEnd(w)}: ${value}`;
  const divider  = "==============================================================";
  const section  = "--------------------------------------------------------------";
  const spSummary = sp?.summary ?? "Source posture not computed.";
  const hasDelta  = !!previousReport && previousReport.theater.id === theater.id;

  // ── EXECUTIVE BRIEF ──────────────────────────────────────────────────────
  if (mode === "executive") {
    const overview2s = theater.overview.split(". ").slice(0, 2).join(". ") + ".";
    return [
      "WARSTATE — EXECUTIVE BRIEF",
      divider,
      "",
      pad("THEATER",        theater.title),
      pad("CODENAME",       theater.codename),
      pad("REGION",         theater.region),
      pad("POSTURE",        runtime.posture),
      pad("CONFIDENCE",     runtime.confidence),
      pad("EVIDENCE",       theater.evidencePosture),
      pad("SOURCE BREADTH", sp?.breadth ?? "—"),
      pad("TIMESTAMP",      runtime.lastUpdated),
      pad("CLASSIFICATION", theater.classification),
      "",
      section,
      "CURRENT STATUS",
      section,
      runtime.currentStatus,
      "",
      section,
      "SITUATION SUMMARY",
      section,
      overview2s,
      "",
      section,
      "KEY ESCALATION DRIVERS",
      section,
      ...theater.escalationDrivers.map((d, i) => `  ${i + 1}. ${d}`),
      "",
      section,
      "WATCH PRIORITY",
      section,
      ...theater.watchNext.map((w, i) => `  ${i + 1}. ${w}`),
      "",
      section,
      "SOURCE POSTURE",
      section,
      `  ${spSummary}`,
      "",
      section,
      "CONFIDENCE NOTE",
      section,
      `  ${theater.confidenceRationale}`,
      "",
      pad("CLASSIFICATION", theater.classification),
    ].join("\n");
  }

  // ── ESCALATION MEMO ──────────────────────────────────────────────────────
  if (mode === "escalation") {
    const friendly = theater.friendly;
    const opposing = theater.opposing;
    return [
      "WARSTATE — ESCALATION MEMO",
      divider,
      "",
      pad("THEATER",        theater.title),
      pad("CODENAME",       theater.codename),
      pad("POSTURE",        runtime.posture),
      pad("CONFIDENCE",     runtime.confidence),
      pad("EVIDENCE",       theater.evidencePosture),
      pad("TIMESTAMP",      runtime.lastUpdated),
      pad("CLASSIFICATION", theater.classification),
      "",
      section,
      "TRIGGER ANALYSIS",
      section,
      ...theater.escalationDrivers.map((d, i) => `  ${i + 1}. ${d}`),
      "",
      section,
      "RISK INDICATORS",
      section,
      ...theater.indicators.slice(0, 3).map((ind, i) => `  ${i + 1}. ${ind}`),
      "",
      section,
      "FORCE POSTURE SUMMARY",
      section,
      "",
      `  ${friendly.label.toUpperCase()}`,
      `    Equipment losses : ${formatNumber(friendly.equipmentLosses)}`,
      `    Casualties (est) : ${friendly.casualties}`,
      `    KIA (est)        : ${friendly.killed}`,
      "",
      `  ${opposing.label.toUpperCase()}`,
      `    Equipment losses : ${formatNumber(opposing.equipmentLosses)}`,
      `    Casualties (est) : ${opposing.casualties}`,
      `    KIA (est)        : ${opposing.killed}`,
      "",
      section,
      "IMMEDIATE WATCH ITEMS",
      section,
      ...theater.watchNext.map((w, i) => `  ${i + 1}. ${w}`),
      "",
      section,
      "SOURCE NOTE",
      section,
      `  ${theater.sourceDiscipline}`,
      "",
      `  ${spSummary}`,
      "",
      section,
      "CONFIDENCE / CLAIM POSTURE",
      section,
      `  ${theater.confidenceRationale}`,
      ...(theater.claimNotes.length
        ? ["", "  CONTESTED ITEMS:", ...theater.claimNotes.map((n) => `    — ${n}`)]
        : []),
      "",
      pad("CLASSIFICATION", theater.classification),
    ].join("\n");
  }

  // ── DAILY THEATER UPDATE ─────────────────────────────────────────────────
  if (mode === "daily") {
    const deltaLines: string[] = [];
    if (hasDelta) {
      deltaLines.push(
        "",
        section,
        `CHANGE SUMMARY  (since ${previousReport!.runtime.lastUpdated})`,
        section,
        `  POSTURE     : ${previousReport!.runtime.posture} → ${runtime.posture}`,
        `  CONFIDENCE  : ${previousReport!.runtime.confidence} → ${runtime.confidence}`,
        "  SECTOR SHIFTS: review stress indicators for updated bar values",
      );
    }
    return [
      "WARSTATE — DAILY THEATER UPDATE",
      divider,
      "",
      pad("THEATER",   theater.title),
      pad("POSTURE",   runtime.posture),
      pad("TIMESTAMP", runtime.lastUpdated),
      "",
      section,
      "STATUS UPDATE",
      section,
      runtime.currentStatus,
      ...deltaLines,
      "",
      section,
      "TODAY'S WATCH PRIORITY",
      section,
      ...theater.watchNext.map((w, i) => `  ${i + 1}. ${w}`),
      "",
      section,
      "KEY INDICATORS (TOP 3)",
      section,
      ...theater.indicators.slice(0, 3).map((ind, i) => `  ${i + 1}. ${ind}`),
      "",
      section,
      "SOURCE DISCIPLINE",
      section,
      `  ${theater.sourceDiscipline}`,
      "",
      pad("CLASSIFICATION", theater.classification),
    ].join("\n");
  }

  // ── ANALYST BRIEF (default) ───────────────────────────────────────────────
  const deltaSection: string[] = [];
  if (hasDelta) {
    deltaSection.push(
      "",
      section,
      "WHAT CHANGED",
      section,
      `  This report is compared against snapshot from ${previousReport!.runtime.lastUpdated}.`,
      `  POSTURE     : ${previousReport!.runtime.posture} → ${runtime.posture}`,
      `  CONFIDENCE  : ${previousReport!.runtime.confidence} → ${runtime.confidence}`,
      "  SECTOR PRESSURE: review stress bars for shifts since prior snapshot",
      ...(previousReport!.theater.id !== theater.id
        ? [`  NOTE: Prior snapshot was from a different theater (${previousReport!.theater.short}). Comparison is cross-theater.`]
        : []),
    );
  }

  return [
    "WARSTATE — ANALYST BRIEF",
    divider,
    "",
    pad("PRODUCT",        `WARSTATE / ${theater.codename}`),
    pad("THEATER",        theater.title),
    pad("DISPLAY NAME",   theater.short),
    pad("REGION",         theater.region),
    pad("CLASSIFICATION", theater.classification),
    pad("POSTURE",        runtime.posture),
    pad("CONFIDENCE",     runtime.confidence),
    pad("EVIDENCE",       theater.evidencePosture),
    pad("SOURCE BREADTH", sp?.breadth ?? "—"),
    pad("LAST REFRESH",   runtime.lastUpdated),
    "",
    section,
    "CURRENT STATUS",
    section,
    runtime.currentStatus,
    "",
    section,
    "EXECUTIVE OVERVIEW",
    section,
    theater.overview,
    "",
    section,
    "ESCALATION DRIVERS",
    section,
    ...theater.escalationDrivers.map((item, idx) => `  ${idx + 1}. ${item}`),
    "",
    section,
    "WATCH NEXT",
    section,
    ...theater.watchNext.map((item, idx) => `  ${idx + 1}. ${item}`),
    ...deltaSection,
    "",
    section,
    "FORCE LEDGER",
    section,
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
    section,
    "PRIORITY INDICATORS",
    section,
    ...theater.indicators.map((item, idx) => `  ${idx + 1}. ${item}`),
    "",
    section,
    "SOURCE STACK",
    section,
    ...theater.sources.map((item, idx) => `  ${idx + 1}. ${item}`),
    "",
    section,
    "CONFIDENCE RATIONALE",
    section,
    `  ${theater.confidenceRationale}`,
    "",
    section,
    "SOURCE POSTURE",
    section,
    `  ${spSummary}`,
    ...(theater.claimNotes.length
      ? [
          "",
          section,
          "CLAIM / CONTEST NOTES",
          section,
          ...theater.claimNotes.map((n, i) => `  ${i + 1}. ${n}`),
        ]
      : []),
  ].join("\n");
}

// Splits "CATEGORY: detail text" strings used in indicators and sources.
// Returns { category, detail } — category is null when no colon prefix found.
export function parseCategory(str: string, maxLen = 55): { category: string | null; detail: string } {
  const ci = str.indexOf(":");
  const has = ci > 0 && ci < maxLen;
  return {
    category: has ? str.slice(0, ci).trim() : null,
    detail: has ? str.slice(ci + 1).trim() : str,
  };
}

// Derives source breadth, strength, and contradiction risk from the theater's
// sources array using the "CATEGORY: ..." prefix convention.
export function buildSourcePosture(theater: Theater): SourcePosture {
  const cats = theater.sources
    .map(s => parseCategory(s, 40).category)
    .filter(Boolean) as string[];
  const uniqueCats = [...new Set(cats)];
  const count = uniqueCats.length;
  const breadth: SourcePosture["breadth"] = count >= 5 ? "BROAD" : count >= 3 ? "MODERATE" : "NARROW";
  const strength: SourcePosture["strength"] = breadth === "BROAD" ? "HIGH" : breadth === "MODERATE" ? "MODERATE" : "LOW";
  const contradictionRisk = theater.sources.some(s => {
    const lower = s.toLowerCase();
    return lower.includes("adversarial") || lower.includes("denial") || lower.includes("disputed");
  });
  const breadthNote =
    breadth === "BROAD"   ? "Source coverage is broad and multi-disciplinary." :
    breadth === "MODERATE" ? "Source coverage is moderate." :
    "Source coverage is narrow — corroboration limited.";
  const contrNote = contradictionRisk
    ? " Adversarial or structurally compromised sources present — cross-reference required before treating claims as baseline."
    : "";
  const summary = `${count} source categories active (${uniqueCats.join(", ")}). ${breadthNote}${contrNote}`;
  return { breadth, categories: uniqueCats, strength, contradictionRisk, summary };
}

// Builds the structured JSON payload for the JSON export.
export function buildJsonPayload(snapshot: ReportSnapshot): object {
  const sp = snapshot.sourcePosture;
  const prev = snapshot.previousReport;
  return {
    meta: {
      product: "WARSTATE",
      reportMode: snapshot.mode,
      reportModeLabel: REPORT_MODE_LABELS[snapshot.mode],
      generatedAt: new Date().toISOString(),
      reportTimestamp: snapshot.runtime.lastUpdated,
    },
    theater: {
      id: snapshot.theater.id,
      short: snapshot.theater.short,
      title: snapshot.theater.title,
      codename: snapshot.theater.codename,
      region: snapshot.theater.region,
      classification: snapshot.theater.classification,
    },
    intelligence: {
      posture: snapshot.runtime.posture,
      confidence: snapshot.runtime.confidence,
      evidencePosture: snapshot.theater.evidencePosture,
      sourcePosture: {
        breadth: sp.breadth,
        strength: sp.strength,
        categories: sp.categories,
        contradictionRisk: sp.contradictionRisk,
        summary: sp.summary,
      },
      sourceDiscipline: snapshot.theater.sourceDiscipline,
    },
    assessment: {
      currentStatus: snapshot.runtime.currentStatus,
      executiveOverview: snapshot.theater.overview,
      escalationDrivers: snapshot.theater.escalationDrivers,
      mainRisks: snapshot.theater.escalationDrivers,
      watchNext: snapshot.theater.watchNext,
    },
    confidence: {
      posture: snapshot.theater.evidencePosture,
      rationale: snapshot.theater.confidenceRationale,
      claimNotes: snapshot.theater.claimNotes,
    },
    indicators: snapshot.theater.indicators,
    forceLedger: {
      friendly: snapshot.theater.friendly,
      opposing: snapshot.theater.opposing,
    },
    sectorStress: snapshot.runtime.sectors,
    attrition: snapshot.trendBars,
    sources: snapshot.theater.sources,
    delta: prev
      ? {
          previousTheaterId:  prev.theater.id,
          previousTheaterName: prev.theater.short,
          previousPosture:    prev.runtime.posture,
          previousConfidence: prev.runtime.confidence,
          previousTimestamp:  prev.runtime.lastUpdated,
          postureChanged:     prev.runtime.posture !== snapshot.runtime.posture,
          confidenceChanged:  prev.runtime.confidence !== snapshot.runtime.confidence,
        }
      : null,
  };
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
// PDF report renderer — structured layout engine with collision-proof ledger
// Force Ledger uses 2-section block format (no side-by-side columns for
// variable-length string values — eliminates all text overflow and collision)
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

  // 2-col key-value layout for Force Ledger
  const KV_LW = 158;          // label column width
  const KV_VW = CW - KV_LW;  // value column width = ~354pt
  const KV_LX = ML;
  const KV_VX = ML + KV_LW;

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

  // Numbered item with bold first line and wrapped continuation.
  // IMPORTANT: font/size MUST be set before getTextWidth and splitTextToSize.
  // The previous operation may have left a different font active (e.g. 7.5pt
  // from sectionHeader). Measuring at 7.5pt then rendering at 8.5pt bold
  // causes ~77pt right-margin overflow on long lines.
  function numberedItem(idx: number, text: string, {
    indent = 12 as number,
    size = 8.5 as number,
    lineH = 13 as number,
    gap = 4 as number,
  } = {}) {
    const prefix = `${idx + 1}.`;

    // Set to bold + correct size FIRST — bold is the widest variant so wrapping
    // measured here will never exceed the render width on any subsequent line.
    doc.setFont("courier", "bold");
    doc.setFontSize(size);

    const prefixW = doc.getTextWidth(prefix) + 6;        // measured at correct size
    const textColW = CW - indent - prefixW;
    const lines = wrappedLines(text, textColW);            // split at correct size
    const totalH = lines.length * lineH + gap;
    checkPage(totalH);

    // Draw prefix in muted normal weight
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

  // ── Force Ledger: 2-column key-value row ──────────────────────────────────
  // Label column (fixed KV_LW) | Value column (flexible KV_VW).
  // Value column is ~354pt — long strings wrap freely, zero collision possible.
  function kvRow(label: string, value: string, isShaded: boolean) {
    const VPAD = 5;
    const HPAD = 8;

    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);

    // Wrap independently — label col is narrow, value col is wide
    const labelLines = wrappedLines(label, KV_LW - HPAD * 2);
    const valueLines = wrappedLines(value, KV_VW - HPAD * 2);
    const maxLines = Math.max(labelLines.length, valueLines.length, 1);
    const lineH = 12;
    const rowH = maxLines * lineH + VPAD * 2;

    checkPage(rowH + 4);

    // Row background
    if (isShaded) {
      doc.setFillColor(...COL_FILL_A);
      doc.rect(ML, y, CW, rowH, "F");
    }

    // Row top border + vertical divider between columns
    doc.setDrawColor(...COL_RULE);
    doc.setLineWidth(0.3);
    doc.line(ML, y, ML + CW, y);
    doc.line(KV_VX, y, KV_VX, y + rowH);

    const textY = y + VPAD + 9;  // baseline of first line

    // Label — bold, muted color (metric name)
    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...COL_MUTED);
    labelLines.forEach((line: string, li: number) => {
      doc.text(line, KV_LX + HPAD, textY + li * lineH);
    });

    // Value — normal, dark color (data value — wraps freely in wide column)
    doc.setFont("courier", "normal");
    doc.setTextColor(...COL_DARK);
    valueLines.forEach((line: string, li: number) => {
      doc.text(line, KV_VX + HPAD, textY + li * lineH);
    });

    y += rowH;
  }

  // Force block sub-header (friendly / opposing section divider)
  function forceBlockHeader(label: string) {
    checkPage(30);
    doc.setFillColor(...COL_FILL_A);
    doc.rect(ML, y, CW, 22, "F");
    doc.setDrawColor(...COL_RULE);
    doc.setLineWidth(0.4);
    doc.line(ML, y, ML + CW, y);
    doc.line(ML, y + 22, ML + CW, y + 22);
    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COL_GREEN);
    doc.text(label, ML + 8, y + 14);
    y += 22;
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

  // ── Summary metadata cells (6 cells in 2 rows of 3) ──────────────────────
  const cellW = Math.floor(CW / 3);
  const cellH = 44;
  const summaryMeta = [
    { label: "THEATER",         value: source.theater.short },
    { label: "POSTURE",         value: source.runtime.posture },
    { label: "CONFIDENCE",      value: source.runtime.confidence },
    { label: "EVIDENCE POSTURE", value: source.theater.evidencePosture },
    { label: "SOURCE BREADTH",  value: source.sourcePosture.breadth },
    { label: "REPORT MODE",     value: REPORT_MODE_LABELS[source.mode] },
  ];

  // Render 2 rows of 3 cells each
  const COLS = 3;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < COLS; col++) {
      const i = row * COLS + col;
      if (i >= summaryMeta.length) break;
      const item = summaryMeta[i];
      const bx = ML + col * cellW;
      const bw = col === COLS - 1 ? CW - col * cellW : cellW;
      const by = y + row * cellH;
      doc.setFillColor(...COL_FILL_A);
      doc.setDrawColor(...COL_RULE);
      doc.setLineWidth(0.4);
      doc.rect(bx, by, bw, cellH, "FD");
      doc.setFont("courier", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...COL_MUTED);
      doc.text(item.label, bx + 7, by + 13);
      doc.setFont("courier", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...COL_DARK);
      const valLines = doc.splitTextToSize(item.value, bw - 14) as string[];
      valLines.slice(0, 2).forEach((line: string, li: number) => {
        doc.text(line, bx + 7, by + 26 + li * 11);
      });
    }
  }
  y += cellH * 2 + 20;

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
  // 2-section block format: Friendly block then Opposing block.
  // Each block uses 2-col key-value rows: metric label | value.
  // Value column is ~354pt wide — all strings wrap freely, zero collision.
  sectionHeader("5.  Force Ledger");

  // FRIENDLY FORCES BLOCK
  forceBlockHeader(`FRIENDLY FORCES — ${source.theater.friendly.label.toUpperCase()}`);
  kvRow("Equipment Losses",    formatNumber(source.theater.friendly.equipmentLosses), true);
  kvRow("Tank Losses",         formatNumber(source.theater.friendly.tankLosses),      false);
  kvRow("Armored Veh. Losses", formatNumber(source.theater.friendly.armoredLosses),   true);
  kvRow("Casualties (Est.)",   source.theater.friendly.casualties,                    false);
  kvRow("KIA (Est.)",          source.theater.friendly.killed,                        true);

  // Close friendly block with bottom border
  doc.setDrawColor(...COL_RULE);
  doc.setLineWidth(0.4);
  doc.line(ML, y, ML + CW, y);
  y += 14;

  // OPPOSING FORCES BLOCK
  forceBlockHeader(`OPPOSING FORCES — ${source.theater.opposing.label.toUpperCase()}`);
  kvRow("Equipment Losses",    formatNumber(source.theater.opposing.equipmentLosses), true);
  kvRow("Tank Losses",         formatNumber(source.theater.opposing.tankLosses),      false);
  kvRow("Armored Veh. Losses", formatNumber(source.theater.opposing.armoredLosses),   true);
  kvRow("Casualties (Est.)",   source.theater.opposing.casualties,                    false);
  kvRow("KIA (Est.)",          source.theater.opposing.killed,                        true);

  // Close opposing block with bottom border
  doc.setDrawColor(...COL_RULE);
  doc.setLineWidth(0.4);
  doc.line(ML, y, ML + CW, y);
  y += 8;

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

  // ── 10. What Changed (only if previousReport present) ────────────────────
  if (source.previousReport) {
    const prev = source.previousReport;
    const sameTheater = prev.theater.id === source.theater.id;
    sectionHeader("10. What Changed");
    paragraph(
      `Compared against snapshot from ${prev.runtime.lastUpdated}.${
        !sameTheater ? ` Note: prior snapshot was for ${prev.theater.short} — cross-theater comparison.` : ""
      }`,
      { size: 8.5, lineH: 12, color: COL_MUTED }
    );
    const changeRows: [string, string][] = [
      ["POSTURE",     `${prev.runtime.posture}  →  ${source.runtime.posture}`],
      ["CONFIDENCE",  `${prev.runtime.confidence}  →  ${source.runtime.confidence}`],
      ["EVIDENCE",    `${prev.theater.evidencePosture}  →  ${source.theater.evidencePosture}`],
    ];
    changeRows.forEach(([lbl, val], idx) => {
      kvRow(lbl, val, idx % 2 === 0);
    });
    doc.setDrawColor(...COL_RULE);
    doc.setLineWidth(0.4);
    doc.line(ML, y, ML + CW, y);
    y += 10;
    paragraph("Sector stress values: compare current bars to prior snapshot for shift direction.", {
      size: 8, lineH: 12, color: COL_MUTED, indent: 8,
    });
  }

  // ── 11. Confidence Rationale ──────────────────────────────────────────────
  const confSectionNum = source.previousReport ? "11." : "10.";
  sectionHeader(`${confSectionNum} Confidence Rationale`);
  paragraph(source.theater.confidenceRationale, { size: 8.5, lineH: 12.5 });
  if (source.theater.claimNotes.length) {
    y += 8;
    doc.setFont("courier", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COL_MUTED);
    doc.text("CONTESTED / CLAIM NOTES", ML, y);
    y += 10;
    source.theater.claimNotes.forEach((note, idx) => {
      numberedItem(idx, note, { indent: 8, size: 8, lineH: 12, gap: 4 });
    });
  }

  // ── 12. Source Posture ────────────────────────────────────────────────────
  const srcSectionNum = source.previousReport ? "12." : "11.";
  sectionHeader(`${srcSectionNum} Source Posture`);
  paragraph(source.sourcePosture.summary, { size: 8.5, lineH: 12.5 });

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
