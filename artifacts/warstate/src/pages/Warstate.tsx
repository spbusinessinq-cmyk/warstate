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

  // activeReport is always a frozen snapshot if generated, otherwise live state
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
      className={`px-4 py-2 border text-[10px] uppercase tracking-[0.22em] transition-colors ${
        expandedPanel === id
          ? "border-emerald-300 bg-emerald-300/10 text-emerald-200"
          : "border-white/10 bg-[#050709] text-[#9ba6ae] hover:border-emerald-400/30 hover:text-[#d7dde2]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020405] text-[#d9dfe3] p-3 md:p-6 font-mono">
      <div className="max-w-[1700px] mx-auto space-y-4">

        {/* Toast notification */}
        {toast && (
          <div className="border border-emerald-300/40 bg-[#061110] px-5 py-3 text-xs uppercase tracking-[0.24em] text-emerald-200">
            {toast}
          </div>
        )}

        <div className="border border-emerald-400/20 bg-[#05080a] shadow-[0_20px_80px_rgba(0,0,0,0.6)]">

          {/* ── Header ── */}
          <div className="border-b border-emerald-400/15 px-4 md:px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-5 items-end">
              {/* Branding */}
              <div className="space-y-2 min-w-0">
                <div className="text-[11px] tracking-[0.34em] uppercase text-emerald-300/60">
                  RSR White Wing // WARSTATE // Operational Status System
                </div>
                <h1 className="text-5xl md:text-6xl font-semibold leading-none tracking-tight">WARSTATE</h1>
                <div className="text-sm text-[#8f9aa3] uppercase tracking-[0.2em]">
                  Battlefield Status Monitor and Report Generator
                </div>
              </div>

              {/* Status summary strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-emerald-400/15 border border-emerald-400/15 min-w-0">
                <div className="bg-[#06090b] px-4 py-4">
                  <div className="text-[9px] text-[#6e7d87] uppercase tracking-[0.28em]">Theater</div>
                  <div className="mt-2 text-sm truncate">{theater.short}</div>
                </div>
                <div className="bg-[#06090b] px-4 py-4">
                  <div className="text-[9px] text-[#6e7d87] uppercase tracking-[0.28em]">Codename</div>
                  <div className="mt-2 text-sm text-emerald-300 truncate">{theater.codename}</div>
                </div>
                <div className="bg-[#06090b] px-4 py-4">
                  <div className="text-[9px] text-[#6e7d87] uppercase tracking-[0.28em]">Posture</div>
                  <div className="mt-2 text-sm text-emerald-300 truncate">{runtime.posture}</div>
                </div>
                <div className="bg-[#06090b] px-4 py-4">
                  <div className="text-[9px] text-[#6e7d87] uppercase tracking-[0.28em]">Last Refresh</div>
                  <div className="mt-2 text-sm truncate">{runtime.lastUpdated}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-5">

              {/* ── Conflict Registry ── */}
              <div className="border border-emerald-400/15 bg-[#06090b] px-4 py-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#6e7d87]">Conflict Registry</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[#6e7d87]">
                    {filteredTheaters.length} visible
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search theater, region, codename..."
                    className="flex-1 bg-[#050709] border border-white/10 px-3 py-2.5 text-sm outline-none placeholder:text-[#5e6d77] focus:border-emerald-400/35 transition-colors"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="px-3 py-2.5 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.16em] hover:border-emerald-400/30 transition-colors whitespace-nowrap"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-5 gap-2">
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
                            ? "border-emerald-300 bg-emerald-300/10 text-emerald-200"
                            : "border-white/10 bg-[#050709] text-[#9ba6ae] hover:border-emerald-400/30 hover:text-[#d7dde2]"
                        }`}
                      >
                        <div className="uppercase tracking-[0.16em] font-semibold">{entry.short}</div>
                        <div className="mt-1 text-[9px] uppercase tracking-[0.14em] opacity-60">
                          {entry.codename}
                        </div>
                      </button>
                    );
                  })}
                  {filteredTheaters.length === 0 && (
                    <div className="col-span-5 py-6 text-center text-xs text-[#5e6d77] uppercase tracking-[0.22em]">
                      No theaters match query
                    </div>
                  )}
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="border border-emerald-400/15 bg-[#06090b] px-4 py-4 space-y-4">
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#6e7d87]">Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={refreshing}
                    onClick={handleRefresh}
                    className="px-3 py-3 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 disabled:opacity-50 transition-colors"
                  >
                    {refreshing ? "Refreshing..." : "Live Refresh"}
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    className="px-3 py-3 border border-emerald-300 bg-emerald-300/10 text-xs uppercase tracking-[0.18em] text-emerald-200 hover:bg-emerald-300/18 transition-colors"
                  >
                    Generate Report
                  </button>
                  <button
                    disabled={exportingPdf}
                    onClick={handleExportPDF}
                    className="px-3 py-3 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 disabled:opacity-50 transition-colors"
                  >
                    {exportingPdf ? "Exporting..." : "Export PDF"}
                  </button>
                  <button
                    onClick={handleExportTXT}
                    className="px-3 py-3 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 transition-colors"
                  >
                    Export TXT
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="px-3 py-3 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 transition-colors"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={handleCopyBrief}
                    className="px-3 py-3 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 transition-colors"
                  >
                    Copy Brief
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-3 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 transition-colors"
                  >
                    Print Report
                  </button>
                  <button
                    onClick={() => setSearch("")}
                    className="px-3 py-3 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
                <div className="text-[10px] leading-6 text-[#8a9aa4] border-t border-white/5 pt-3">
                  {generatedReport
                    ? `Report locked: ${generatedReport.theater.short} // ${generatedReport.runtime.lastUpdated}`
                    : "No active report — exports use live state until report is generated."}
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">

              {/* ── Current Status panel ── */}
              <div className="border border-emerald-400/15 bg-[#06090b]">
                <div className="border-b border-emerald-400/10 px-5 py-3 text-[10px] uppercase tracking-[0.28em] text-[#6e7d87]">
                  Current Status
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-5">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-2">Product</div>
                      <div className="text-lg leading-tight text-[#f2f5f7]">{theater.title}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-2">Classification</div>
                      <div className="text-sm text-[#c0c9cf] leading-6">{theater.classification}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-2">Source Discipline</div>
                      <div className="text-sm leading-6 text-[#c0c9cf]">{theater.sourceDiscipline}</div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-2">Status Line</div>
                      <div className="text-sm leading-6 text-[#c0c9cf]">{runtime.currentStatus}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-white/8">
                      <div className="bg-[#050709] px-3 py-3">
                        <div className="text-[9px] uppercase tracking-[0.22em] text-[#6e7d87] mb-2">Region</div>
                        <div className="text-sm">{theater.region}</div>
                      </div>
                      <div className="bg-[#050709] px-3 py-3">
                        <div className="text-[9px] uppercase tracking-[0.22em] text-[#6e7d87] mb-2">Confidence</div>
                        <div className="text-sm">{runtime.confidence}</div>
                      </div>
                      <div className="bg-[#050709] px-3 py-3">
                        <div className="text-[9px] uppercase tracking-[0.22em] text-[#6e7d87] mb-2">Refresh Count</div>
                        <div className="text-sm">{refreshCount}</div>
                      </div>
                      <div className="bg-[#050709] px-3 py-3">
                        <div className="text-[9px] uppercase tracking-[0.22em] text-[#6e7d87] mb-2">Engine</div>
                        <div className="text-sm">REPORT CORE</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Detail panels ── */}
              <div className="border border-emerald-400/15 bg-[#06090b]">
                <div className="border-b border-emerald-400/10 px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#6e7d87]">Detail Panels</div>
                  <div className="flex flex-wrap gap-2">
                    {panelButton("overview", "Overview")}
                    {panelButton("ledger", "Ledger")}
                    {panelButton("indicators", "Indicators")}
                    {panelButton("stress", "Stress")}
                    {panelButton("sources", "Sources")}
                  </div>
                </div>

                <div className="p-5 min-h-[440px]">

                  {/* Overview */}
                  {expandedPanel === "overview" && (
                    <div className="space-y-5">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-3">
                          Executive Overview
                        </div>
                        <p className="text-sm leading-7 text-[#c7d0d6]">{theater.overview}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {theater.indicators.slice(0, 3).map((item) => (
                          <div
                            key={item}
                            className="border border-white/8 bg-[#050709] px-3 py-3 text-sm leading-6 text-[#c7d0d6]"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ledger */}
                  {expandedPanel === "ledger" && (
                    <div className="border border-white/10 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#081014] text-[#8a9aa4] uppercase tracking-[0.18em] text-[9px]">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium">Metric</th>
                            <th className="text-left px-4 py-3 font-medium">{theater.friendly.label}</th>
                            <th className="text-left px-4 py-3 font-medium">{theater.opposing.label}</th>
                            <th className="text-left px-4 py-3 font-medium">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonRows.map(([metric, friendly, opposing, note], idx) => (
                            <tr key={metric} className={idx % 2 === 0 ? "bg-[#050709]" : "bg-[#070b0d]"}>
                              <td className="px-4 py-3 text-[#dde3e7]">{metric}</td>
                              <td className="px-4 py-3 text-[#bec8ce]">{friendly}</td>
                              <td className="px-4 py-3 text-[#bec8ce]">{opposing}</td>
                              <td className="px-4 py-3 text-[#6e7d87] uppercase text-[9px] tracking-[0.18em]">{note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Indicators */}
                  {expandedPanel === "indicators" && (
                    <div className="space-y-3">
                      <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-3">Priority Indicators</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {theater.indicators.map((item, idx) => (
                          <div
                            key={item}
                            className="border border-white/8 bg-[#050709] px-4 py-3 text-sm leading-6 text-[#c7d0d6]"
                          >
                            <span className="text-[#6e7d87] text-[10px] tracking-[0.14em] mr-2">{idx + 1}.</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stress */}
                  {expandedPanel === "stress" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87]">
                          Sector Stress Index
                        </div>
                        {runtime.sectors.map((sector) => (
                          <div key={sector.name}>
                            <div className="flex justify-between text-[11px] text-[#b8c2c8] mb-2 uppercase tracking-[0.14em]">
                              <span>{sector.name}</span>
                              <span className="tabular-nums">{sector.value}</span>
                            </div>
                            <div className="h-3 bg-[#0b1114] border border-white/5">
                              <div
                                className="h-full bg-emerald-300/85 transition-all duration-700"
                                style={{ width: `${sector.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-5">
                        <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87]">
                          Relative Attrition
                        </div>
                        {trendBars.map((bar) => (
                          <div key={bar.label}>
                            <div className="flex justify-between gap-4 text-[11px] text-[#b8c2c8] mb-2 uppercase tracking-[0.14em]">
                              <span>{bar.label}</span>
                              <span className="tabular-nums">
                                {bar.friendly} / {bar.opposing}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="h-3 bg-[#0b1114] border border-white/5">
                                <div
                                  className="h-full bg-emerald-300/85 transition-all duration-700"
                                  style={{ width: `${bar.friendly}%` }}
                                />
                              </div>
                              <div className="h-3 bg-[#0b1114] border border-white/5">
                                <div
                                  className="h-full bg-[#7e8a93] transition-all duration-700"
                                  style={{ width: `${bar.opposing}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-5 text-[9px] uppercase tracking-[0.18em] text-[#6e7d87] pt-2 border-t border-white/5">
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-3 h-2 bg-emerald-300/85" />
                            {theater.friendly.label}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-3 h-2 bg-[#7e8a93]" />
                            {theater.opposing.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {expandedPanel === "sources" && (
                    <div className="space-y-4">
                      <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-3">Source Stack</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {theater.sources.map((source, idx) => (
                          <div
                            key={source}
                            className="border border-white/8 bg-[#050709] px-4 py-3 text-sm leading-6 text-[#c7d0d6]"
                          >
                            <span className="text-[#6e7d87] text-[10px] tracking-[0.14em] mr-2">{idx + 1}.</span>
                            {source}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual copy fallback modal */}
      {manualCopyOpen && (
        <ManualCopyModal
          reportText={activeReport.reportText}
          onClose={() => setManualCopyOpen(false)}
        />
      )}

      {/* Report modal */}
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
