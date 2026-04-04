import { useEffect, useMemo, useState } from "react";
import { THEATERS, THEATER_ORDER, POSTURE_MAP, CONFIDENCE_MAP } from "@/data/theaters";
import {
  clamp,
  buildComparisonRows,
  buildTrendBars,
  buildReportText,
  downloadFile,
  copyToClipboard,
  openPrintWindow,
  renderPDFReport,
  ReportSnapshot,
} from "@/lib/warstate-utils";
import { ReportModal } from "@/components/warstate/ReportModal";
import { ManualCopyModal } from "@/components/warstate/ManualCopyModal";

type PanelId = "overview" | "ledger" | "indicators" | "stress" | "sources";

// ─── Color tokens (Splinter Cell tactical palette) ───────────────────────────
// BG_PAGE      #020304   near-pure black
// BG_SHELL     #070a0e   primary container surface
// BG_PANEL     #09100d   panel surface (very slight warm-dark tint)
// BG_CARD      #060a0d   sunken card
// BG_ACTIVE    #071812   active state tint
// BD_DEFAULT   #1a2830   steel blue-gray border
// BD_SUBTLE    #111c24   very subtle border
// BD_ACTIVE    #265c42   muted green border (active only)
// BD_HOVER     #1e3d2e   hover border
// TX_PRIMARY   #c4d0d8   main text
// TX_SECONDARY #8a9eaa   secondary text
// TX_MUTED     #52666e   label text
// TX_ACCENT    #4caf87   green accent (muted, restrained)
// TX_ACTIVE    #5ec998   active state green text
// BAR_FILL     #1c6348   tactical green bar fill
// BAR_TRACK    #0a1214   dark bar track
// BAR_OPP      #374a56   opposing force bar (steel)
// ─────────────────────────────────────────────────────────────────────────────

export default function Warstate() {
  const [selectedTheaterId, setSelectedTheaterId] = useState("iran");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [reportOpen, setReportOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportSnapshot | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [expandedPanel, setExpandedPanel] = useState<PanelId>("overview");
  const [manualCopyOpen, setManualCopyOpen] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredTheaters = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return THEATER_ORDER;
    return THEATER_ORDER.filter((id) => {
      const t = THEATERS[id];
      return [t.short, t.title, t.region, t.codename, t.overview].join(" ").toLowerCase().includes(q);
    });
  }, [search]);

  const theater = THEATERS[selectedTheaterId];

  const runtime = useMemo(() => {
    const drift = refreshCount % 3;
    const sectors = theater.sectors.map((sector, index) => ({
      ...sector,
      value: clamp(sector.value + ((index + refreshCount) % 2 === 0 ? drift : -drift), 18, 99),
    }));
    return {
      posture: POSTURE_MAP[selectedTheaterId][refreshCount % 3],
      confidence: CONFIDENCE_MAP[selectedTheaterId][refreshCount % 3],
      sectors,
      lastUpdated: lastUpdated.toLocaleString(),
      currentStatus: theater.statusLine,
    };
  }, [theater, selectedTheaterId, lastUpdated, refreshCount]);

  const comparisonRows = useMemo(() => buildComparisonRows(theater), [theater]);
  const trendBars = useMemo(() => buildTrendBars(theater), [theater]);
  const reportText = useMemo(() => buildReportText(theater, runtime), [theater, runtime]);

  const activeReport: ReportSnapshot = generatedReport ?? {
    theater,
    runtime,
    comparisonRows,
    trendBars,
    reportText,
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLastUpdated(new Date());
    setRefreshCount((c) => c + 1);
    setRefreshing(false);
    setToast("Status refreshed");
  };

  const handleGenerateReport = () => {
    const snapshot: ReportSnapshot = { theater, runtime, comparisonRows, trendBars, reportText };
    setGeneratedReport(snapshot);
    setReportOpen(true);
    setToast("Report generated and locked");
  };

  const handleExportPDF = async () => {
    setExportingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const source = activeReport;
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      renderPDFReport(doc, source);
      doc.save(`warstate-${source.theater.id}-report.pdf`);
      setToast("PDF exported");
    } catch (err) {
      console.error("PDF export failed:", err);
      const opened = openPrintWindow(
        `${activeReport.theater.title} // Print Fallback`,
        activeReport.reportText
      );
      setToast(opened ? "PDF unavailable — print fallback opened" : "PDF export failed");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportTXT = () => {
    downloadFile(`warstate-${activeReport.theater.id}.txt`, activeReport.reportText);
    setToast("TXT exported");
  };

  const handleExportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      theater: activeReport.theater.title,
      codename: activeReport.theater.codename,
      posture: activeReport.runtime.posture,
      confidence: activeReport.runtime.confidence,
      lastRefresh: activeReport.runtime.lastUpdated,
      currentStatus: activeReport.runtime.currentStatus,
      classification: activeReport.theater.classification,
      sourceDiscipline: activeReport.theater.sourceDiscipline,
      data: activeReport.theater,
      sectors: activeReport.runtime.sectors,
      trendBars: activeReport.trendBars,
    };
    downloadFile(
      `warstate-${activeReport.theater.id}.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8"
    );
    setToast("JSON exported");
  };

  const handleCopyBrief = async () => {
    const copied = await copyToClipboard(activeReport.reportText);
    if (copied) {
      setToast("Brief copied to clipboard");
      setManualCopyOpen(false);
    } else {
      setManualCopyOpen(true);
      setToast("Clipboard blocked — manual copy modal opened");
    }
  };

  const handlePrint = () => {
    const opened = openPrintWindow(
      `${activeReport.theater.title} // ${activeReport.theater.codename}`,
      activeReport.reportText
    );
    setToast(opened ? "Print window opened" : "Print window blocked by browser");
  };

  const panelButton = (id: PanelId, label: string) => (
    <button
      key={id}
      onClick={() => setExpandedPanel(id)}
      className={`px-4 py-2 border text-[10px] uppercase tracking-[0.2em] transition-colors ${
        expandedPanel === id
          ? "border-[#265c42] bg-[#071812] text-[#5ec998]"
          : "border-[#1a2830] bg-[#060a0d] text-[#52666e] hover:border-[#1e3d2e] hover:text-[#8a9eaa]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020304] text-[#c4d0d8] p-3 md:p-6 font-mono">
      <div className="max-w-[1700px] mx-auto space-y-4">

        {/* ── Toast ── */}
        {toast && (
          <div className="border border-[#265c42] bg-[#040e0a] px-5 py-3 text-xs uppercase tracking-[0.26em] text-[#5ec998]">
            {toast}
          </div>
        )}

        {/* ── Main shell ── */}
        <div className="border border-[#1a2830] bg-[#070a0e] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">

          {/* ════════════════════════════════
              HEADER BLOCK
          ════════════════════════════════ */}
          <div className="border-b border-[#111c24] px-5 md:px-7 py-6 space-y-6">

            {/* Brand + status strip */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-5 items-end">
              <div className="space-y-2">
                <div className="text-[10px] tracking-[0.38em] uppercase text-[#2e5c48]">
                  RSR White Wing &nbsp;//&nbsp; WARSTATE &nbsp;//&nbsp; Operational Status System
                </div>
                <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight text-[#eef2f4]">
                  WARSTATE
                </h1>
                <div className="text-[11px] text-[#52666e] uppercase tracking-[0.22em] pt-1">
                  Battlefield Status Monitor &amp; Report Generator
                </div>
              </div>

              {/* Live status strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1a2830] border border-[#1a2830]">
                <div className="bg-[#060a0d] px-5 py-4">
                  <div className="text-[9px] text-[#52666e] uppercase tracking-[0.28em] mb-2">Theater</div>
                  <div className="text-sm text-[#c4d0d8] truncate">{theater.short}</div>
                </div>
                <div className="bg-[#060a0d] px-5 py-4">
                  <div className="text-[9px] text-[#52666e] uppercase tracking-[0.28em] mb-2">Codename</div>
                  <div className="text-sm text-[#4caf87] truncate">{theater.codename}</div>
                </div>
                <div className="bg-[#060a0d] px-5 py-4">
                  <div className="text-[9px] text-[#52666e] uppercase tracking-[0.28em] mb-2">Posture</div>
                  <div className="text-sm text-[#4caf87] truncate">{runtime.posture}</div>
                </div>
                <div className="bg-[#060a0d] px-5 py-4">
                  <div className="text-[9px] text-[#52666e] uppercase tracking-[0.28em] mb-2">Last Refresh</div>
                  <div className="text-sm text-[#c4d0d8] truncate">{runtime.lastUpdated}</div>
                </div>
              </div>
            </div>

            {/* Registry + Actions row */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-5">

              {/* ── Conflict Registry ── */}
              <div className="border border-[#1a2830] bg-[#09100d] px-5 py-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">Conflict Registry</div>
                  <div className="text-[9px] uppercase tracking-[0.22em] text-[#52666e]">
                    {filteredTheaters.length} visible
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search theater, region, codename..."
                    className="flex-1 bg-[#060a0d] border border-[#1a2830] px-3 py-2.5 text-sm text-[#c4d0d8] outline-none placeholder:text-[#2e4050] focus:border-[#1e3d2e] transition-colors"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="px-3 py-2.5 border border-[#1a2830] bg-[#060a0d] text-[10px] uppercase tracking-[0.18em] text-[#52666e] hover:border-[#1e3d2e] hover:text-[#8a9eaa] transition-colors whitespace-nowrap"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {filteredTheaters.map((id) => {
                    const entry = THEATERS[id];
                    const active = id === selectedTheaterId;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedTheaterId(id)}
                        title={`${entry.short} // ${entry.codename}`}
                        className={`px-3 py-3 border text-xs text-left transition-colors ${
                          active
                            ? "border-[#265c42] bg-[#071812] text-[#5ec998]"
                            : "border-[#1a2830] bg-[#060a0d] text-[#8a9eaa] hover:border-[#1e3d2e] hover:text-[#c4d0d8]"
                        }`}
                      >
                        <div className="uppercase tracking-[0.16em] font-bold">{entry.short}</div>
                        <div className={`mt-1 text-[9px] uppercase tracking-[0.14em] ${active ? "text-[#3d8a66]" : "text-[#364a56]"}`}>
                          {entry.codename}
                        </div>
                      </button>
                    );
                  })}
                  {filteredTheaters.length === 0 && (
                    <div className="col-span-5 py-6 text-center text-[10px] text-[#364a56] uppercase tracking-[0.22em]">
                      No theaters match query
                    </div>
                  )}
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="border border-[#1a2830] bg-[#09100d] px-5 py-4 space-y-4">
                <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">Actions</div>

                {/* Primary CTA */}
                <button
                  onClick={handleGenerateReport}
                  className="w-full px-4 py-4 border border-[#265c42] bg-[#071812] text-sm uppercase tracking-[0.22em] text-[#5ec998] hover:bg-[#0a2018] hover:border-[#306e4e] transition-colors"
                >
                  Generate Report
                </button>

                {/* Secondary actions grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={refreshing}
                    onClick={handleRefresh}
                    className="px-3 py-3 border border-[#1a2830] bg-[#060a0d] text-[11px] uppercase tracking-[0.18em] text-[#8a9eaa] hover:border-[#1e3d2e] hover:text-[#c4d0d8] disabled:opacity-50 transition-colors"
                  >
                    {refreshing ? "Refreshing..." : "Live Refresh"}
                  </button>
                  <button
                    disabled={exportingPdf}
                    onClick={handleExportPDF}
                    className="px-3 py-3 border border-[#1a2830] bg-[#060a0d] text-[11px] uppercase tracking-[0.18em] text-[#8a9eaa] hover:border-[#1e3d2e] hover:text-[#c4d0d8] disabled:opacity-50 transition-colors"
                  >
                    {exportingPdf ? "Exporting..." : "Export PDF"}
                  </button>
                  <button
                    onClick={handleExportTXT}
                    className="px-3 py-3 border border-[#1a2830] bg-[#060a0d] text-[11px] uppercase tracking-[0.18em] text-[#8a9eaa] hover:border-[#1e3d2e] hover:text-[#c4d0d8] transition-colors"
                  >
                    Export TXT
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="px-3 py-3 border border-[#1a2830] bg-[#060a0d] text-[11px] uppercase tracking-[0.18em] text-[#8a9eaa] hover:border-[#1e3d2e] hover:text-[#c4d0d8] transition-colors"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={handleCopyBrief}
                    className="px-3 py-3 border border-[#1a2830] bg-[#060a0d] text-[11px] uppercase tracking-[0.18em] text-[#8a9eaa] hover:border-[#1e3d2e] hover:text-[#c4d0d8] transition-colors"
                  >
                    Copy Brief
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-3 border border-[#1a2830] bg-[#060a0d] text-[11px] uppercase tracking-[0.18em] text-[#8a9eaa] hover:border-[#1e3d2e] hover:text-[#c4d0d8] transition-colors"
                  >
                    Print Report
                  </button>
                  <button
                    onClick={() => setSearch("")}
                    className="col-span-2 px-3 py-2.5 border border-[#111c24] bg-[#060a0d] text-[10px] uppercase tracking-[0.18em] text-[#364a56] hover:border-[#1a2830] hover:text-[#52666e] transition-colors"
                  >
                    Clear Search
                  </button>
                </div>

                {/* Report lock status */}
                <div className="text-[10px] leading-5 text-[#364a56] border-t border-[#111c24] pt-3">
                  {generatedReport
                    ? `Locked: ${generatedReport.theater.short} // ${generatedReport.runtime.lastUpdated}`
                    : "No locked report — exports use live state until generated."}
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════
              MAIN CONTENT GRID
          ════════════════════════════════ */}
          <div className="p-5 md:p-7 space-y-5">
            <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-5">

              {/* ── Current Status ── */}
              <div className="border border-[#1a2830] bg-[#09100d]">
                <div className="border-b border-[#111c24] px-5 py-3">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">Current Status</div>
                </div>
                <div className="p-5 space-y-5">

                  {/* Product title */}
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.28em] text-[#52666e] mb-2">Product</div>
                    <div className="text-xl leading-tight text-[#eef2f4] font-semibold">{theater.title}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-4">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.28em] text-[#52666e] mb-2">Classification</div>
                        <div className="text-sm text-[#8a9eaa] leading-6">{theater.classification}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.28em] text-[#52666e] mb-2">Source Discipline</div>
                        <div className="text-sm text-[#8a9eaa] leading-6">{theater.sourceDiscipline}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.28em] text-[#52666e] mb-2">Status Line</div>
                        <div className="text-sm text-[#b0bec6] leading-6">{runtime.currentStatus}</div>
                      </div>
                    </div>
                  </div>

                  {/* Stat grid */}
                  <div className="grid grid-cols-2 gap-px bg-[#111c24]">
                    <div className="bg-[#060a0d] px-4 py-3">
                      <div className="text-[9px] uppercase tracking-[0.24em] text-[#52666e] mb-2">Region</div>
                      <div className="text-sm text-[#c4d0d8]">{theater.region}</div>
                    </div>
                    <div className="bg-[#060a0d] px-4 py-3">
                      <div className="text-[9px] uppercase tracking-[0.24em] text-[#52666e] mb-2">Confidence</div>
                      <div className="text-sm text-[#c4d0d8]">{runtime.confidence}</div>
                    </div>
                    <div className="bg-[#060a0d] px-4 py-3">
                      <div className="text-[9px] uppercase tracking-[0.24em] text-[#52666e] mb-2">Refresh Count</div>
                      <div className="text-sm text-[#c4d0d8] tabular-nums">{refreshCount}</div>
                    </div>
                    <div className="bg-[#060a0d] px-4 py-3">
                      <div className="text-[9px] uppercase tracking-[0.24em] text-[#52666e] mb-2">Engine</div>
                      <div className="text-sm text-[#c4d0d8]">REPORT CORE</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Detail Panels ── */}
              <div className="border border-[#1a2830] bg-[#09100d]">
                {/* Panel tab bar */}
                <div className="border-b border-[#111c24] px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">Detail Panels</div>
                  <div className="flex flex-wrap gap-2">
                    {panelButton("overview", "Overview")}
                    {panelButton("ledger", "Ledger")}
                    {panelButton("indicators", "Indicators")}
                    {panelButton("stress", "Stress")}
                    {panelButton("sources", "Sources")}
                  </div>
                </div>

                <div className="p-5 min-h-[460px]">

                  {/* ── OVERVIEW ── */}
                  {expandedPanel === "overview" && (
                    <div className="space-y-6">

                      {/* Executive Overview */}
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e] mb-3">Executive Overview</div>
                        <p className="text-sm leading-7 text-[#b0bec6]">{theater.overview}</p>
                      </div>

                      {/* Escalation Drivers */}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">Escalation Drivers</div>
                          <div className="flex-1 border-t border-[#111c24]" />
                        </div>
                        <div className="space-y-2">
                          {theater.escalationDrivers.map((driver, idx) => (
                            <div key={idx} className="flex gap-3 border border-[#1a2830] bg-[#060a0d] px-4 py-3">
                              <div className="text-[10px] font-bold text-[#4caf87] tabular-nums select-none mt-0.5 shrink-0">
                                {String(idx + 1).padStart(2, "0")}
                              </div>
                              <div className="text-sm leading-6 text-[#8a9eaa]">{driver}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Watch Next */}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">Watch Next</div>
                          <div className="flex-1 border-t border-[#111c24]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {theater.watchNext.map((item, idx) => (
                            <div
                              key={idx}
                              className="border border-[#111c24] bg-[#060a0d] px-3 py-3"
                            >
                              <div className="text-[9px] text-[#265c42] mb-1.5 uppercase tracking-[0.2em]">Watch Item {idx + 1}</div>
                              <div className="text-sm leading-6 text-[#8a9eaa]">{item}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ── LEDGER ── */}
                  {expandedPanel === "ledger" && (
                    <div className="border border-[#1a2830] overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#060a0d]">
                          <tr className="border-b border-[#1a2830]">
                            <th className="text-left px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-[#52666e] font-medium">Metric</th>
                            <th className="text-left px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-[#52666e] font-medium">{theater.friendly.label}</th>
                            <th className="text-left px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-[#52666e] font-medium">{theater.opposing.label}</th>
                            <th className="text-left px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-[#52666e] font-medium">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonRows.map(([metric, friendly, opposing, note], idx) => (
                            <tr
                              key={metric}
                              className={`border-b border-[#111c24] last:border-0 ${idx % 2 === 0 ? "bg-[#060a0d]" : "bg-[#080e0b]"}`}
                            >
                              <td className="px-4 py-3 text-[#c4d0d8]">{metric}</td>
                              <td className="px-4 py-3 text-[#8a9eaa]">{friendly}</td>
                              <td className="px-4 py-3 text-[#8a9eaa]">{opposing}</td>
                              <td className="px-4 py-3 text-[9px] uppercase tracking-[0.18em] text-[#364a56]">{note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── INDICATORS ── */}
                  {expandedPanel === "indicators" && (
                    <div className="space-y-2">
                      <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e] mb-4">Priority Indicators</div>
                      {theater.indicators.map((item, idx) => {
                        const colonIdx = item.indexOf(":");
                        const hasCategory = colonIdx > 0 && colonIdx < 40;
                        const category = hasCategory ? item.slice(0, colonIdx) : null;
                        const detail = hasCategory ? item.slice(colonIdx + 1).trim() : item;
                        return (
                          <div
                            key={idx}
                            className="flex gap-4 border border-[#1a2830] bg-[#060a0d] px-4 py-3"
                          >
                            <div className="text-[10px] font-bold text-[#52666e] tabular-nums select-none mt-0.5 shrink-0 w-5">
                              {idx + 1}.
                            </div>
                            <div>
                              {category && (
                                <div className="text-[9px] uppercase tracking-[0.22em] text-[#4caf87] mb-1">{category}</div>
                              )}
                              <div className="text-sm leading-6 text-[#8a9eaa]">{detail}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── STRESS ── */}
                  {expandedPanel === "stress" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">
                          Sector Stress Index
                        </div>
                        {runtime.sectors.map((sector) => (
                          <div key={sector.name}>
                            <div className="flex justify-between text-[11px] text-[#8a9eaa] mb-2 uppercase tracking-[0.14em]">
                              <span>{sector.name}</span>
                              <span className="tabular-nums text-[#52666e]">{sector.value}</span>
                            </div>
                            <div className="h-2.5 bg-[#0a1214] border border-[#1a2830]">
                              <div
                                className="h-full bg-[#1c6348] transition-all duration-700"
                                style={{ width: `${sector.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-5">
                        <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">
                          Relative Attrition
                        </div>
                        {trendBars.map((bar) => (
                          <div key={bar.label}>
                            <div className="flex justify-between gap-4 text-[11px] text-[#8a9eaa] mb-2 uppercase tracking-[0.14em]">
                              <span>{bar.label}</span>
                              <span className="tabular-nums text-[#52666e]">{bar.friendly} / {bar.opposing}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="h-2.5 bg-[#0a1214] border border-[#1a2830]">
                                <div
                                  className="h-full bg-[#1c6348] transition-all duration-700"
                                  style={{ width: `${bar.friendly}%` }}
                                />
                              </div>
                              <div className="h-2.5 bg-[#0a1214] border border-[#1a2830]">
                                <div
                                  className="h-full bg-[#374a56] transition-all duration-700"
                                  style={{ width: `${bar.opposing}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-5 text-[9px] uppercase tracking-[0.18em] text-[#364a56] pt-3 border-t border-[#111c24]">
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-3 h-1.5 bg-[#1c6348]" />
                            {theater.friendly.label}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-3 h-1.5 bg-[#374a56]" />
                            {theater.opposing.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── SOURCES ── */}
                  {expandedPanel === "sources" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">Source Stack</div>
                        <div className="flex-1 border-t border-[#111c24]" />
                        <div className="text-[9px] uppercase tracking-[0.2em] text-[#364a56]">{theater.sources.length} categories</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {theater.sources.map((src, idx) => {
                          const colonIdx = src.indexOf(":");
                          const hasCategory = colonIdx > 0 && colonIdx < 50;
                          const category = hasCategory ? src.slice(0, colonIdx).trim() : null;
                          const detail = hasCategory ? src.slice(colonIdx + 1).trim() : src;
                          return (
                            <div
                              key={idx}
                              className="border border-[#1a2830] bg-[#060a0d] px-4 py-3"
                            >
                              {category && (
                                <div className="text-[9px] uppercase tracking-[0.22em] text-[#4caf87] mb-1.5">{category}</div>
                              )}
                              <div className="text-[11px] leading-5 text-[#7a8e9a]">{detail}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {manualCopyOpen && (
        <ManualCopyModal
          reportText={activeReport.reportText}
          onClose={() => setManualCopyOpen(false)}
        />
      )}

      {reportOpen && (
        <ReportModal
          report={activeReport}
          exportingPdf={exportingPdf}
          onClose={() => setReportOpen(false)}
          onExportPDF={handleExportPDF}
          onExportTXT={handleExportTXT}
          onExportJSON={handleExportJSON}
          onCopyBrief={handleCopyBrief}
        />
      )}
    </div>
  );
}
