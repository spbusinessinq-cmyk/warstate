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
        typeof theater.friendly.equipmentLosses === "number" && typeof theater.opposing.equipmentLosses === "number" && theater.opposing.equipmentLosses > 0
          ? Math.max(5, Math.round((theater.friendly.equipmentLosses / theater.opposing.equipmentLosses) * 100))
          : 0,
      opposing: typeof theater.opposing.equipmentLosses === "number" && theater.opposing.equipmentLosses > 0 ? 100 : 0,
    },
    {
      label: "Tank Attrition",
      friendly:
        typeof theater.friendly.tankLosses === "number" && typeof theater.opposing.tankLosses === "number" && theater.opposing.tankLosses > 0
          ? Math.max(5, Math.round((theater.friendly.tankLosses / theater.opposing.tankLosses) * 100))
          : 0,
      opposing: typeof theater.opposing.tankLosses === "number" && theater.opposing.tankLosses > 0 ? 100 : 0,
    },
    {
      label: "Armored Attrition",
      friendly:
        typeof theater.friendly.armoredLosses === "number" && typeof theater.opposing.armoredLosses === "number" && theater.opposing.armoredLosses > 0
          ? Math.max(5, Math.round((theater.friendly.armoredLosses / theater.opposing.armoredLosses) * 100))
          : 0,
      opposing: typeof theater.opposing.armoredLosses === "number" && theater.opposing.armoredLosses > 0 ? 100 : 0,
    },
  ];
}

export function buildReportText(theater: Theater, runtime: Runtime): string {
  return [
    "CENTRAL INTELLIGENCE-STYLE BATTLEFIELD STATUS REPORT",
    "",
    `PRODUCT: WARSTATE / ${theater.codename}`,
    `THEATER: ${theater.title}`,
    `DISPLAY NAME: ${theater.short}`,
    `REGION: ${theater.region}`,
    `CLASSIFICATION: ${theater.classification}`,
    `POSTURE: ${runtime.posture}`,
    `CONFIDENCE: ${runtime.confidence}`,
    `LAST REFRESH: ${runtime.lastUpdated}`,
    `SOURCE DISCIPLINE: ${theater.sourceDiscipline}`,
    "",
    "CURRENT STATUS",
    runtime.currentStatus,
    "",
    "EXECUTIVE OVERVIEW",
    theater.overview,
    "",
    "FORCE LEDGER",
    `${theater.friendly.label} | Total equipment losses: ${formatNumber(theater.friendly.equipmentLosses)}`,
    `${theater.opposing.label} | Total equipment losses: ${formatNumber(theater.opposing.equipmentLosses)}`,
    `${theater.friendly.label} | Tank losses: ${formatNumber(theater.friendly.tankLosses)}`,
    `${theater.opposing.label} | Tank losses: ${formatNumber(theater.opposing.tankLosses)}`,
    `${theater.friendly.label} | Armored losses: ${formatNumber(theater.friendly.armoredLosses)}`,
    `${theater.opposing.label} | Armored losses: ${formatNumber(theater.opposing.armoredLosses)}`,
    "",
    "PRIORITY INDICATORS",
    ...theater.indicators.map((item, idx) => `${idx + 1}. ${item}`),
    "",
    "SOURCE STACK",
    ...theater.sources.map((item, idx) => `${idx + 1}. ${item}`),
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
    // fall through
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
  const escapedTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedBody = reportText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
  printWindow.document.write(`<!doctype html><html><head><title>${escapedTitle}</title><style>
    body { background:#ffffff; color:#111111; font-family: Courier New, monospace; padding:32px; line-height:1.5; }
    h1 { font-size:18px; margin:0 0 16px 0; }
    .report { white-space:normal; font-size:12px; }
    @media print { body { padding:18px; } }
  </style></head><body><h1>${escapedTitle}</h1><div class="report">${escapedBody}</div></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
  return true;
}
