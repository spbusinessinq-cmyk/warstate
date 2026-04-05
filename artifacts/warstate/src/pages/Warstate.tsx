import { useEffect, useMemo, useState } from "react";
import { THEATERS, THEATER_ORDER, POSTURE_MAP, CONFIDENCE_MAP } from "@/data/theaters";
import {
  clamp,
  buildComparisonRows,
  buildTrendBars,
  buildReportText,
  buildSourcePosture,
  buildJsonPayload,
  downloadFile,
  copyToClipboard,
  openPrintWindow,
  renderPDFReport,
  parseCategory,
  ReportSnapshot,
  ReportMode,
  REPORT_MODE_LABELS,
} from "@/lib/warstate-utils";
import { ReportModal } from "@/components/warstate/ReportModal";
import { ManualCopyModal } from "@/components/warstate/ManualCopyModal";

type PanelId = "overview" | "ledger" | "indicators" | "stress" | "sources";
type HistoryEntry = ReportSnapshot & { generatedAt: string };

// ─── Color system ─────────────────────────────────────────────────────────────
// BG_PAGE      #020304   near-black page foundation
// BG_SHELL     #06090c   primary container surface — neutral graphite
// BG_PANEL     #080c10   panel surface — cool dark graphite, no green tint
// BG_CARD      #050810   sunken card — coolest/darkest surface
// BG_ACTIVE    #061018   active state bg — very dark blue-slate, not green
// BD_DEFAULT   #1e2d38   steel border
// BD_SUBTLE    #121e28   very subtle border
// BD_ACTIVE    #265c42   restrained green border — ACTIVE ONLY
// BD_HOVER     #25364a   cool steel hover — NOT green
// TX_PRIMARY   #c8d6de   primary text — cool off-white
// TX_BODY      #9aaebb   body text — slightly cooler
// TX_SECONDARY #7a8e9a   secondary text
// TX_MUTED     #4e6472   muted label
// TX_DIMMED    #374650   very muted / metadata
// TX_ACTIVE    #5ec998   bright tactical green — ACTIVE ONLY
// TX_CATEGORY  #617888   steel accent for category labels — NOT green
// BAR_FILL     #1c6348   green bar fill
// BAR_OPP      #374a56   steel opposing bar
// ─────────────────────────────────────────────────────────────────────────────

export default function Warstate() {
  const [selectedTheaterId, setSelectedTheaterId] = useState("iran");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [reportOpen, setReportOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportSnapshot | null>(null);
  const [previousReport, setPreviousReport] = useState<ReportSnapshot | null>(null);
  const [reportHistory, setReportHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [reportMode, setReportMode] = useState<ReportMode>("analyst");
  const [refreshCount, setRefreshCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [expandedPanel, setExpandedPanel] = useState<PanelId>("overview");
  const [manualCopyOpen, setManualCopyOpen] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
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
  const sourcePosture = useMemo(() => buildSourcePosture(theater), [theater]);
  const reportText = useMemo(
    () => buildReportText(theater, runtime, reportMode, previousReport, sourcePosture),
    [theater, runtime, reportMode, previousReport, sourcePosture],
  );

  const activeReport: ReportSnapshot = generatedReport ?? {
    theater,
    runtime,
    comparisonRows,
    trendBars,
    reportText,
    mode: reportMode,
    sourcePosture,
    previousReport,
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
    const generatedAt = new Date().toLocaleString();
    const snapshot: HistoryEntry = {
      theater,
      runtime,
      comparisonRows,
      trendBars,
      reportText,
      mode: reportMode,
      sourcePosture,
      generatedAt,
      previousReport,
    };
    setPreviousReport(generatedReport);
    setGeneratedReport(snapshot);
    setReportHistory((prev) => [snapshot, ...prev].slice(0, 8));
    setReportOpen(true);
    setToast(`${REPORT_MODE_LABELS[reportMode]} generated and locked`);
  };

  const handleReopenHistory = (entry: HistoryEntry) => {
    setGeneratedReport(entry);
    setReportOpen(true);
    setShowHistory(false);
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
    const payload = buildJsonPayload(activeReport);
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
      className={`px-4 py-2 border text-[10px] uppercase tracking-[0.22em] transition-colors ${
        expandedPanel === id
          ? "border-[#265c42] bg-[#061018] text-[#5ec998]"
          : "border-[#1e2d38] bg-[#050810] text-[#4e6472] hover:border-[#25364a] hover:text-[#7a8e9a]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020304] text-[#c8d6de] p-3 md:p-5 font-mono">
      <div className="max-w-[1720px] mx-auto space-y-3">

        {/* ── Toast ── */}
        {toast && (
          <div className="border border-[#265c42] bg-[#030810] px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-[#5ec998]">
            {toast}
          </div>
        )}

        {/* ── Main shell ── */}
        <div className="border border-[#1e2d38] bg-[#06090c] shadow-[0_32px_100px_rgba(0,0,0,0.85),0_0_0_1px_rgba(0,0,0,0.5)]">

          {/* ════════════════════════════════════════
              HEADER
          ════════════════════════════════════════ */}
          <div className="border-b border-[#121e28] px-5 md:px-8 pt-6 pb-5 space-y-5">

            {/* Brand row */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-5 items-start">

              {/* Brand */}
              <div>
                <div className="text-[9px] tracking-[0.44em] uppercase text-[#3a4e5a] mb-3">
                  RSR White Wing &nbsp;//&nbsp; WARSTATE &nbsp;//&nbsp; Operational Status System
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-1 h-14 bg-[#265c42] shrink-0" />
                  <div>
                    <h1 className="text-5xl md:text-[72px] font-bold leading-none tracking-[-0.01em] text-[#e2eaee]">
                      WARSTATE
                    </h1>
                    <div className="text-[10px] text-[#4e6472] uppercase tracking-[0.28em] mt-2">
                      Battlefield Status Monitor &amp; Report Generator
                    </div>
                  </div>
                </div>
              </div>

              {/* Live status strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 border border-[#1e2d38] divide-x divide-[#1e2d38]">
                <div className="bg-[#050810] px-5 py-4">
                  <div className="text-[8px] text-[#4e6472] uppercase tracking-[0.32em] mb-2">Theater</div>
                  <div className="text-sm font-semibold text-[#c8d6de] truncate">{theater.short}</div>
                </div>
                <div className="bg-[#050810] px-5 py-4">
                  <div className="text-[8px] text-[#4e6472] uppercase tracking-[0.32em] mb-2">Codename</div>
                  <div className="text-sm font-semibold text-[#5ec998] truncate">{theater.codename}</div>
                </div>
                <div className="bg-[#050810] px-5 py-4">
                  <div className="text-[8px] text-[#4e6472] uppercase tracking-[0.32em] mb-2">Posture</div>
                  <div className="text-sm font-semibold text-[#5ec998] truncate">{runtime.posture}</div>
                </div>
                <div className="bg-[#050810] px-5 py-4">
                  <div className="text-[8px] text-[#4e6472] uppercase tracking-[0.32em] mb-2">Last Refresh</div>
                  <div className="text-[12px] text-[#c8d6de] tabular-nums truncate">{runtime.lastUpdated}</div>
                </div>
              </div>
            </div>

            {/* Registry + Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">

              {/* ── Conflict Registry ── */}
              <div className="border border-[#1e2d38] bg-[#080c10]">
                <div className="border-b border-[#121e28] px-5 py-3 flex items-center justify-between">
                  <div className="text-[8px] uppercase tracking-[0.36em] text-[#4e6472]">Conflict Registry</div>
                  <div className="text-[8px] uppercase tracking-[0.24em] text-[#374650] tabular-nums">{filteredTheaters.length} of {THEATER_ORDER.length}</div>
                </div>
                <div className="px-4 pt-3 pb-3 space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search theater, region, codename..."
                      className="flex-1 bg-[#050810] border border-[#1e2d38] px-3 py-2.5 text-[12px] text-[#c8d6de] outline-none placeholder:text-[#2c3d48] focus:border-[#25364a] transition-colors"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="px-3 py-2.5 border border-[#1e2d38] bg-[#050810] text-[9px] uppercase tracking-[0.2em] text-[#4e6472] hover:border-[#25364a] hover:text-[#7a8e9a] transition-colors whitespace-nowrap"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                    {filteredTheaters.map((id) => {
                      const entry = THEATERS[id];
                      const active = id === selectedTheaterId;
                      return (
                        <button
                          key={id}
                          onClick={() => setSelectedTheaterId(id)}
                          title={`${entry.short} // ${entry.codename}`}
                          className={`px-3 py-4 border text-left transition-colors ${
                            active
                              ? "border-[#265c42] bg-[#061018] text-[#5ec998]"
                              : "border-[#1e2d38] bg-[#050810] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de]"
                          }`}
                        >
                          <div className="text-[11px] uppercase tracking-[0.18em] font-bold leading-none">{entry.short}</div>
                          <div className={`mt-2 text-[8px] uppercase tracking-[0.16em] ${active ? "text-[#5ec998]" : "text-[#374650]"}`}>
                            {entry.codename}
                          </div>
                        </button>
                      );
                    })}
                    {filteredTheaters.length === 0 && (
                      <div className="col-span-5 py-7 text-center text-[9px] text-[#374650] uppercase tracking-[0.26em]">
                        No theaters match query
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="border border-[#1e2d38] bg-[#080c10]">
                <div className="border-b border-[#121e28] px-5 py-3">
                  <div className="text-[8px] uppercase tracking-[0.36em] text-[#4e6472]">Actions</div>
                </div>
                <div className="px-4 pt-4 pb-4 space-y-3">

                  {/* Report Mode Selector */}
                  <div>
                    <div className="text-[7px] uppercase tracking-[0.32em] text-[#374650] mb-1.5">Report Mode</div>
                    <div className="grid grid-cols-4 gap-1">
                      {(["executive", "analyst", "escalation", "daily"] as ReportMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setReportMode(m)}
                          className={`px-2 py-2 border text-[8px] uppercase tracking-[0.18em] transition-colors ${
                            reportMode === m
                              ? "border-[#265c42] bg-[#061018] text-[#5ec998]"
                              : "border-[#121e28] bg-[#050810] text-[#374650] hover:border-[#1e2d38] hover:text-[#4e6472]"
                          }`}
                        >
                          {m === "executive" ? "Exec" : m === "analyst" ? "Analyst" : m === "escalation" ? "Escalation" : "Daily"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Workflow Status Strip */}
                  <div className="border border-[#121e28] bg-[#050810] px-3 py-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] uppercase tracking-[0.28em] text-[#374650]">Mode</span>
                      <span className="text-[8px] text-[#5ec998] uppercase tracking-[0.18em]">{REPORT_MODE_LABELS[reportMode]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] uppercase tracking-[0.28em] text-[#374650]">Lock State</span>
                      <span className={`text-[8px] uppercase tracking-[0.18em] ${generatedReport ? "text-[#5ec998]" : "text-[#374650]"}`}>
                        {generatedReport ? "Snapshot Locked" : "Live State"}
                      </span>
                    </div>
                    {generatedReport && (
                      <div className="flex items-center justify-between">
                        <span className="text-[7px] uppercase tracking-[0.28em] text-[#374650]">Last Report</span>
                        <span className="text-[8px] text-[#617888] truncate max-w-[140px]">{generatedReport.theater.short} / {REPORT_MODE_LABELS[generatedReport.mode].split(" ")[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary CTA */}
                  <button
                    onClick={handleGenerateReport}
                    className="w-full px-4 py-4 border border-[#265c42] bg-[#061018] text-[12px] uppercase tracking-[0.26em] text-[#5ec998] hover:bg-[#081420] hover:border-[#2f7050] transition-colors font-semibold"
                  >
                    Generate Report
                  </button>

                  {/* Secondary grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      disabled={refreshing}
                      onClick={handleRefresh}
                      className="px-3 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.2em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] disabled:opacity-40 transition-colors"
                    >
                      {refreshing ? "Refreshing..." : "Live Refresh"}
                    </button>
                    <button
                      disabled={exportingPdf}
                      onClick={handleExportPDF}
                      className="px-3 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.2em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] disabled:opacity-40 transition-colors"
                    >
                      {exportingPdf ? "Exporting..." : "Export PDF"}
                    </button>
                    <button
                      onClick={handleExportTXT}
                      className="px-3 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.2em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] transition-colors"
                    >
                      Export TXT
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="px-3 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.2em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] transition-colors"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={handleCopyBrief}
                      className="px-3 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.2em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] transition-colors"
                    >
                      Copy Brief
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.2em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] transition-colors"
                    >
                      Print Report
                    </button>
                    <button
                      onClick={() => setSearch("")}
                      disabled={!search}
                      className="col-span-2 px-3 py-2.5 border border-[#121e28] bg-[#050810] text-[9px] uppercase tracking-[0.2em] text-[#374650] hover:border-[#1e2d38] hover:text-[#4e6472] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>

                  {/* Report History Toggle */}
                  {reportHistory.length > 0 && (
                    <div className="border-t border-[#121e28] pt-3">
                      <button
                        onClick={() => setShowHistory((v) => !v)}
                        className="w-full flex items-center justify-between px-3 py-2.5 border border-[#1e2d38] bg-[#050810] text-[9px] uppercase tracking-[0.2em] text-[#4e6472] hover:border-[#25364a] hover:text-[#7a8e9a] transition-colors"
                      >
                        <span>Report History ({reportHistory.length})</span>
                        <span>{showHistory ? "▲" : "▼"}</span>
                      </button>
                      {showHistory && (
                        <div className="border border-t-0 border-[#1e2d38] bg-[#050810] divide-y divide-[#121e28]">
                          {reportHistory.map((entry, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleReopenHistory(entry)}
                              className="w-full text-left px-3 py-2.5 hover:bg-[#080c10] transition-colors group"
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[8px] uppercase tracking-[0.18em] text-[#5ec998] group-hover:text-[#7ec9a8]">
                                  {entry.theater.short}
                                </span>
                                <span className="text-[7px] uppercase tracking-[0.14em] text-[#265c42] border border-[#265c42] px-1.5 py-0.5">
                                  {REPORT_MODE_LABELS[entry.mode].split(" ")[0]}
                                </span>
                              </div>
                              <div className="text-[7px] text-[#374650] tracking-wide">{entry.generatedAt}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lock status indicator */}
                  <div className="flex items-center gap-2 text-[9px] leading-5 text-[#374650] border-t border-[#121e28] pt-2">
                    <div className={`w-1.5 h-1.5 shrink-0 ${generatedReport ? "bg-[#265c42]" : "bg-[#1e2d38]"}`} />
                    {generatedReport
                      ? `Locked: ${generatedReport.theater.short} // ${generatedReport.generatedAt ?? generatedReport.runtime.lastUpdated}`
                      : "No locked report — exports use live state until generated."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              ANALYSIS WORKSPACE
          ════════════════════════════════════════ */}
          <div className="p-5 md:p-7 space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-[0.82fr_1.18fr] gap-4">

              {/* ── Current Status Card ── */}
              <div className="border border-[#1e2d38] bg-[#080c10]">
                <div className="border-b border-[#121e28] px-5 py-3 flex items-center gap-3">
                  <div className="w-1 h-4 bg-[#265c42] shrink-0" />
                  <div className="text-[8px] uppercase tracking-[0.36em] text-[#4e6472]">Current Status</div>
                </div>
                <div className="p-5 space-y-5">

                  {/* Product title */}
                  <div>
                    <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-2">Product</div>
                    <div className="text-2xl leading-tight text-[#e2eaee] font-bold tracking-tight">{theater.title}</div>
                  </div>

                  {/* Classification + Source Discipline */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">Classification</div>
                      <div className="text-[12px] text-[#617888] leading-5">{theater.classification}</div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">Source Discipline</div>
                      <div className="text-[12px] text-[#617888] leading-5">{theater.sourceDiscipline}</div>
                    </div>
                  </div>

                  {/* Status Line */}
                  <div className="border-l-2 border-[#1e2d38] pl-4">
                    <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-2">Status Line</div>
                    <div className="text-[13px] text-[#9aaebb] leading-6">{runtime.currentStatus}</div>
                  </div>

                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 border border-[#121e28] divide-x divide-y divide-[#121e28]">
                    <div className="px-4 py-3 bg-[#050810]">
                      <div className="text-[8px] uppercase tracking-[0.28em] text-[#4e6472] mb-1.5">Region</div>
                      <div className="text-[12px] text-[#c8d6de]">{theater.region}</div>
                    </div>
                    <div className="px-4 py-3 bg-[#050810]">
                      <div className="text-[8px] uppercase tracking-[0.28em] text-[#4e6472] mb-1.5">Confidence</div>
                      <div className="text-[12px] text-[#c8d6de]">{runtime.confidence}</div>
                    </div>
                    <div className="px-4 py-3 bg-[#050810]">
                      <div className="text-[8px] uppercase tracking-[0.28em] text-[#4e6472] mb-1.5">Evidence Posture</div>
                      <div className={`text-[12px] font-semibold ${
                        theater.evidencePosture === "CONFIRMED" ? "text-[#5ec998]" :
                        theater.evidencePosture === "LIKELY"    ? "text-[#8abbd0]" :
                        theater.evidencePosture === "CONTESTED" ? "text-[#c8884e]" :
                        "text-[#7a8e9a]"
                      }`}>{theater.evidencePosture}</div>
                    </div>
                    <div className="px-4 py-3 bg-[#050810]">
                      <div className="text-[8px] uppercase tracking-[0.28em] text-[#4e6472] mb-1.5">Source Breadth</div>
                      <div className={`text-[12px] font-semibold ${
                        sourcePosture.breadth === "BROAD"    ? "text-[#5ec998]" :
                        sourcePosture.breadth === "MODERATE" ? "text-[#8abbd0]" :
                        "text-[#c8884e]"
                      }`}>{sourcePosture.breadth}</div>
                    </div>
                    <div className="px-4 py-3 bg-[#050810]">
                      <div className="text-[8px] uppercase tracking-[0.28em] text-[#4e6472] mb-1.5">Refresh Count</div>
                      <div className="text-[12px] text-[#c8d6de] tabular-nums">{refreshCount}</div>
                    </div>
                    <div className="px-4 py-3 bg-[#050810]">
                      <div className="text-[8px] uppercase tracking-[0.28em] text-[#4e6472] mb-1.5">Contra. Risk</div>
                      <div className={`text-[12px] font-semibold ${sourcePosture.contradictionRisk ? "text-[#c8884e]" : "text-[#5ec998]"}`}>
                        {sourcePosture.contradictionRisk ? "PRESENT" : "NONE FLAGGED"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Detail Panels ── */}
              <div className="border border-[#1e2d38] bg-[#080c10]">
                {/* Panel tab bar */}
                <div className="border-b border-[#121e28] bg-[#050810] px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
                  <div className="text-[8px] uppercase tracking-[0.36em] text-[#4e6472]">Analysis Modules</div>
                  <div className="flex flex-wrap gap-1.5">
                    {panelButton("overview", "Overview")}
                    {panelButton("ledger", "Ledger")}
                    {panelButton("indicators", "Indicators")}
                    {panelButton("stress", "Stress")}
                    {panelButton("sources", "Sources")}
                  </div>
                </div>

                <div className="p-5 min-h-[500px]">

                  {/* ──────── OVERVIEW ──────── */}
                  {expandedPanel === "overview" && (
                    <div className="space-y-6">

                      {/* Executive Overview */}
                      <div>
                        <div className="text-[8px] uppercase tracking-[0.34em] text-[#4e6472] mb-3">Executive Overview</div>
                        <p className="text-[13px] leading-7 text-[#9aaebb]">{theater.overview}</p>
                      </div>

                      {/* Escalation Drivers */}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-[8px] uppercase tracking-[0.34em] text-[#4e6472] shrink-0">Escalation Drivers</div>
                          <div className="flex-1 border-t border-[#121e28]" />
                        </div>
                        <div className="space-y-2">
                          {theater.escalationDrivers.map((driver, idx) => {
                            const { category, detail } = parseCategory(driver, 60);
                            return (
                              <div key={idx} className="flex gap-4 border border-[#1e2d38] bg-[#050810] px-4 py-3">
                                <div className="text-[9px] font-bold text-[#374650] tabular-nums select-none mt-0.5 shrink-0 w-5">
                                  {String(idx + 1).padStart(2, "0")}
                                </div>
                                <div>
                                  {category && (
                                    <div className="text-[8px] uppercase tracking-[0.24em] text-[#617888] mb-1">{category}</div>
                                  )}
                                  <div className="text-[13px] leading-6 text-[#7a8e9a]">{detail}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Watch Next */}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-[8px] uppercase tracking-[0.34em] text-[#4e6472] shrink-0">Watch Next</div>
                          <div className="flex-1 border-t border-[#121e28]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {theater.watchNext.map((item, idx) => (
                            <div
                              key={idx}
                              className="border border-[#1e2d38] bg-[#050810] px-3 py-3"
                            >
                              <div className="text-[8px] uppercase tracking-[0.24em] text-[#374650] mb-2">Watch {idx + 1}</div>
                              <div className="text-[12px] leading-5 text-[#7a8e9a]">{item}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ──────── LEDGER ──────── */}
                  {expandedPanel === "ledger" && (
                    <div>
                      <div className="text-[8px] uppercase tracking-[0.34em] text-[#4e6472] mb-4">Force Ledger</div>
                      <div className="border border-[#1e2d38] overflow-hidden">
                        <table className="w-full text-[12px]">
                          <thead className="bg-[#050810]">
                            <tr className="border-b border-[#1e2d38]">
                              <th className="text-left px-4 py-3 text-[8px] uppercase tracking-[0.24em] text-[#4e6472] font-medium">Metric</th>
                              <th className="text-left px-4 py-3 text-[8px] uppercase tracking-[0.24em] text-[#4e6472] font-medium">{theater.friendly.label}</th>
                              <th className="text-left px-4 py-3 text-[8px] uppercase tracking-[0.24em] text-[#4e6472] font-medium">{theater.opposing.label}</th>
                              <th className="text-left px-4 py-3 text-[8px] uppercase tracking-[0.24em] text-[#4e6472] font-medium">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparisonRows.map(([metric, friendly, opposing, note], idx) => (
                              <tr
                                key={metric}
                                className={`border-b border-[#121e28] last:border-0 ${idx % 2 === 0 ? "bg-[#050810]" : "bg-[#080c10]"}`}
                              >
                                <td className="px-4 py-3 text-[#c8d6de]">{metric}</td>
                                <td className="px-4 py-3 text-[#7a8e9a]">{friendly}</td>
                                <td className="px-4 py-3 text-[#7a8e9a]">{opposing}</td>
                                <td className="px-4 py-3 text-[8px] uppercase tracking-[0.2em] text-[#374650]">{note}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ──────── INDICATORS ──────── */}
                  {expandedPanel === "indicators" && (
                    <div>
                      <div className="text-[8px] uppercase tracking-[0.34em] text-[#4e6472] mb-4">Priority Indicators</div>
                      <div className="space-y-2">
                        {theater.indicators.map((item, idx) => {
                          const { category, detail } = parseCategory(item);
                          return (
                            <div
                              key={idx}
                              className="flex gap-4 border border-[#1e2d38] bg-[#050810] px-4 py-3"
                            >
                              <div className="text-[9px] font-bold text-[#374650] tabular-nums select-none mt-0.5 shrink-0 w-5">
                                {idx + 1}.
                              </div>
                              <div>
                                {category && (
                                  <div className="text-[8px] uppercase tracking-[0.24em] text-[#617888] mb-1.5">{category}</div>
                                )}
                                <div className="text-[13px] leading-6 text-[#7a8e9a]">{detail}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ──────── STRESS ──────── */}
                  {expandedPanel === "stress" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                      {/* Sector Stress */}
                      <div>
                        <div className="text-[8px] uppercase tracking-[0.34em] text-[#4e6472] mb-5">Sector Stress Index</div>
                        <div className="space-y-5">
                          {runtime.sectors.map((sector) => (
                            <div key={sector.name}>
                              <div className="flex justify-between items-baseline mb-2">
                                <span className="text-[10px] text-[#7a8e9a] uppercase tracking-[0.16em]">{sector.name}</span>
                                <span className="text-[11px] tabular-nums text-[#4e6472] font-bold">{sector.value}</span>
                              </div>
                              <div className="h-2 bg-[#050810] border border-[#1e2d38]">
                                <div
                                  className="h-full bg-[#1c6348] transition-all duration-700"
                                  style={{ width: `${sector.value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Relative Attrition */}
                      <div>
                        <div className="text-[8px] uppercase tracking-[0.34em] text-[#4e6472] mb-5">Relative Attrition</div>
                        <div className="space-y-5">
                          {trendBars.map((bar) => (
                            <div key={bar.label}>
                              <div className="flex justify-between items-baseline mb-2">
                                <span className="text-[10px] text-[#7a8e9a] uppercase tracking-[0.16em]">{bar.label}</span>
                                <span className="text-[10px] tabular-nums text-[#374650]">{bar.friendly} / {bar.opposing}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="h-2 bg-[#050810] border border-[#1e2d38]">
                                  <div className="h-full bg-[#1c6348] transition-all duration-700" style={{ width: `${bar.friendly}%` }} />
                                </div>
                                <div className="h-2 bg-[#050810] border border-[#1e2d38]">
                                  <div className="h-full bg-[#374a56] transition-all duration-700" style={{ width: `${bar.opposing}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-6 text-[8px] uppercase tracking-[0.2em] text-[#374650] mt-6 pt-4 border-t border-[#121e28]">
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-4 h-1.5 bg-[#1c6348]" />
                            {theater.friendly.label}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-4 h-1.5 bg-[#374a56]" />
                            {theater.opposing.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ──────── SOURCES ──────── */}
                  {expandedPanel === "sources" && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-[8px] uppercase tracking-[0.34em] text-[#4e6472] shrink-0">Source Stack</div>
                        <div className="flex-1 border-t border-[#121e28]" />
                        <div className="text-[8px] uppercase tracking-[0.22em] text-[#374650] tabular-nums">{theater.sources.length} categories</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {theater.sources.map((src, idx) => {
                          const { category, detail } = parseCategory(src, 50);
                          return (
                            <div
                              key={idx}
                              className="border border-[#1e2d38] bg-[#050810] px-4 py-3"
                            >
                              {category && (
                                <div className="text-[8px] uppercase tracking-[0.26em] text-[#617888] mb-2">{category}</div>
                              )}
                              <div className="text-[11px] leading-5 text-[#617888]">{detail}</div>
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
