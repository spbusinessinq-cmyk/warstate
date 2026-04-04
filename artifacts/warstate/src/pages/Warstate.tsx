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
    const timer = setTimeout(() => setToast(""), 2500);
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
    setGeneratedReport({ theater, runtime, comparisonRows, trendBars, reportText });
    setReportOpen(true);
    setToast("Report generated");
  };

  const handleExportPDF = async () => {
    setExportingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const source = activeReport;
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      doc.setFillColor(5, 8, 10);
      doc.rect(0, 0, 612, 792, "F");
      doc.setDrawColor(52, 211, 153);
      doc.setLineWidth(1);
      doc.rect(26, 26, 560, 740);
      doc.setTextColor(220, 227, 232);
      doc.setFont("courier", "bold");
      doc.setFontSize(18);
      doc.text("WARSTATE // FIELD STATUS REPORT", 42, 52);
      doc.setFontSize(10);
      doc.text(`${source.theater.title} // ${source.runtime.lastUpdated}`, 42, 70);
      doc.setFont("courier", "normal");
      const lines = doc.splitTextToSize(source.reportText, 508);
      doc.text(lines, 42, 94);
      const currentY = 520;
      source.runtime.sectors.forEach((item, i) => {
        const y = currentY + i * 24;
        doc.setFont("courier", "bold");
        doc.setFontSize(9);
        doc.setTextColor(220, 227, 232);
        doc.text(item.name, 42, y);
        doc.setDrawColor(35, 45, 48);
        doc.setFillColor(10, 17, 20);
        doc.rect(42, y + 6, 210, 10, "FD");
        doc.setFillColor(52, 211, 153);
        doc.rect(42, y + 6, Math.max(0, Math.min(210, (item.value / 100) * 210)), 10, "F");
        doc.setFont("courier", "normal");
        doc.text(`${item.value}/100`, 42 + 210 + 8, y + 14);
      });
      doc.save(`warstate-${source.theater.id}-report.pdf`);
      setToast("PDF exported");
    } catch {
      const opened = openPrintWindow(`${activeReport.theater.title} PDF Fallback`, activeReport.reportText);
      setToast(opened ? "PDF fallback opened" : "PDF export failed");
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
      currentStatus: activeReport.runtime.currentStatus,
      data: activeReport.theater,
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
      setToast("Brief copied");
      setManualCopyOpen(false);
    } else {
      setManualCopyOpen(true);
      setToast("Clipboard blocked — manual copy available");
    }
  };

  const handlePrint = () => {
    const opened = openPrintWindow(`${activeReport.theater.title} // Print`, activeReport.reportText);
    setToast(opened ? "Print opened" : "Print blocked");
  };

  const panelButton = (id: PanelId, label: string) => (
    <button
      key={id}
      onClick={() => setExpandedPanel(id)}
      className={`px-3 py-2 border text-[10px] uppercase tracking-[0.2em] transition-colors ${
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
      <div className="max-w-[1700px] mx-auto space-y-3">
        {toast && (
          <div className="border border-emerald-300/30 bg-[#071012] px-4 py-3 text-xs uppercase tracking-[0.22em] text-emerald-200 animate-in fade-in slide-in-from-top-1 duration-200">
            {toast}
          </div>
        )}

        <div className="border border-emerald-400/20 bg-[#05080a] shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
          {/* Header */}
          <div className="border-b border-emerald-400/15 px-4 md:px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-4 items-end">
              <div className="space-y-2 min-w-0">
                <div className="text-[11px] tracking-[0.34em] uppercase text-emerald-300/65">
                  RSR WHITE WING // WARSTATE // OPERATIONAL STATUS SYSTEM
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold leading-none tracking-tight">WARSTATE</h1>
                <div className="text-sm text-[#8f9aa3] uppercase tracking-[0.18em]">
                  Battlefield status monitor and report generator
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-emerald-400/15 border border-emerald-400/15 min-w-0">
                <div className="bg-[#06090b] px-4 py-3">
                  <div className="text-[10px] text-[#7a868f] uppercase tracking-[0.24em]">Theater</div>
                  <div className="mt-2 text-sm truncate">{theater.short}</div>
                </div>
                <div className="bg-[#06090b] px-4 py-3">
                  <div className="text-[10px] text-[#7a868f] uppercase tracking-[0.24em]">Codename</div>
                  <div className="mt-2 text-sm text-emerald-300 truncate">{theater.codename}</div>
                </div>
                <div className="bg-[#06090b] px-4 py-3">
                  <div className="text-[10px] text-[#7a868f] uppercase tracking-[0.24em]">Posture</div>
                  <div className="mt-2 text-sm text-emerald-300 truncate">{runtime.posture}</div>
                </div>
                <div className="bg-[#06090b] px-4 py-3">
                  <div className="text-[10px] text-[#7a868f] uppercase tracking-[0.24em]">Last Refresh</div>
                  <div className="mt-2 text-sm truncate">{runtime.lastUpdated}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-4">
              {/* Theater Registry */}
              <div className="border border-emerald-400/15 bg-[#06090b] px-4 py-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] uppercase tracking-[0.26em] text-[#7a868f]">Conflict registry</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[#7a868f]">{filteredTheaters.length} visible</div>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search theater, region, codename..."
                  className="w-full bg-[#050709] border border-white/10 px-3 py-3 text-sm outline-none placeholder:text-[#66727b] focus:border-emerald-400/30 transition-colors"
                />
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
                        <div className="uppercase tracking-[0.16em]">{entry.short}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.14em] opacity-70">Code: {entry.codename}</div>
                      </button>
                    );
                  })}
                  {filteredTheaters.length === 0 && (
                    <div className="col-span-5 py-4 text-center text-xs text-[#66727b] uppercase tracking-[0.2em]">
                      No theaters match query
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="border border-emerald-400/15 bg-[#06090b] px-4 py-4 space-y-3">
                <div className="text-[10px] uppercase tracking-[0.26em] text-[#7a868f]">Actions</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    disabled={refreshing}
                    onClick={handleRefresh}
                    className="px-3 py-3 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 disabled:opacity-60 transition-colors"
                  >
                    {refreshing ? "Refreshing..." : "Live Refresh"}
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    className="px-3 py-3 border border-emerald-300 bg-emerald-300/10 text-xs uppercase tracking-[0.18em] text-emerald-200 hover:bg-emerald-300/15 transition-colors"
                  >
                    Generate Report
                  </button>
                  <button
                    disabled={exportingPdf}
                    onClick={handleExportPDF}
                    className="px-3 py-3 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 disabled:opacity-60 transition-colors"
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
                <div className="text-[11px] leading-6 text-[#95a1aa]">
                  All export actions snapshot the active report at generation time. PDF export lazy-loads the renderer on click.
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">
              {/* Status panel */}
              <div className="border border-emerald-400/15 bg-[#06090b]">
                <div className="border-b border-emerald-400/10 px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">
                  Current status
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">Product</div>
                      <div className="mt-2 text-lg text-[#f2f5f7]">{theater.title}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">Classification</div>
                      <div className="mt-2 text-sm text-[#c0c9cf]">{theater.classification}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">Source discipline</div>
                      <div className="mt-2 text-sm leading-6 text-[#c0c9cf]">{theater.sourceDiscipline}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">Status line</div>
                      <div className="mt-2 text-sm leading-6 text-[#c0c9cf]">{runtime.currentStatus}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-white/10">
                      <div className="bg-[#050709] px-3 py-3">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a868f]">Region</div>
                        <div className="mt-2 text-sm">{theater.region}</div>
                      </div>
                      <div className="bg-[#050709] px-3 py-3">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a868f]">Confidence</div>
                        <div className="mt-2 text-sm">{runtime.confidence}</div>
                      </div>
                      <div className="bg-[#050709] px-3 py-3">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a868f]">Refresh Count</div>
                        <div className="mt-2 text-sm">{refreshCount}</div>
                      </div>
                      <div className="bg-[#050709] px-3 py-3">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a868f]">Engine</div>
                        <div className="mt-2 text-sm">REPORT CORE</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail panels */}
              <div className="border border-emerald-400/15 bg-[#06090b]">
                <div className="border-b border-emerald-400/10 px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">Detail panels</div>
                  <div className="flex flex-wrap gap-2">
                    {panelButton("overview", "Overview")}
                    {panelButton("ledger", "Ledger")}
                    {panelButton("indicators", "Indicators")}
                    {panelButton("stress", "Stress")}
                    {panelButton("sources", "Sources")}
                  </div>
                </div>

                <div className="p-4 min-h-[420px]">
                  {expandedPanel === "overview" && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">Executive overview</div>
                        <p className="mt-3 text-sm leading-7 text-[#c7d0d6]">{theater.overview}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {theater.indicators.slice(0, 3).map((item) => (
                          <div key={item} className="border border-white/10 bg-[#050709] px-3 py-3 text-sm leading-6 text-[#c7d0d6]">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {expandedPanel === "ledger" && (
                    <div className="border border-white/10 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#081014] text-[#93a0a9] uppercase tracking-[0.18em] text-[10px]">
                          <tr>
                            <th className="text-left px-3 py-3 font-medium">Metric</th>
                            <th className="text-left px-3 py-3 font-medium">{theater.friendly.label}</th>
                            <th className="text-left px-3 py-3 font-medium">{theater.opposing.label}</th>
                            <th className="text-left px-3 py-3 font-medium">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonRows.map(([metric, friendly, opposing, note], idx) => (
                            <tr key={metric} className={idx % 2 === 0 ? "bg-[#050709]" : "bg-[#070b0d]"}>
                              <td className="px-3 py-3 text-[#dde3e7]">{metric}</td>
                              <td className="px-3 py-3 text-[#bec8ce]">{friendly}</td>
                              <td className="px-3 py-3 text-[#bec8ce]">{opposing}</td>
                              <td className="px-3 py-3 text-[#7d8992] uppercase text-[10px] tracking-[0.18em]">{note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {expandedPanel === "indicators" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {theater.indicators.map((item) => (
                        <div key={item} className="border border-white/10 bg-[#050709] px-3 py-3 text-sm leading-6 text-[#c7d0d6]">
                          {item}
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedPanel === "stress" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f] mb-1">Sector stress index</div>
                        {runtime.sectors.map((sector) => (
                          <div key={sector.name}>
                            <div className="flex justify-between text-[11px] text-[#b8c2c8] mb-2 uppercase tracking-[0.14em]">
                              <span>{sector.name}</span>
                              <span>{sector.value}</span>
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
                      <div className="space-y-4">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f] mb-1">Relative attrition</div>
                        {trendBars.map((bar) => (
                          <div key={bar.label}>
                            <div className="flex justify-between gap-4 text-[11px] text-[#b8c2c8] mb-2 uppercase tracking-[0.14em]">
                              <span>{bar.label}</span>
                              <span>{bar.friendly} / {bar.opposing}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="h-3 bg-[#0b1114] border border-white/5">
                                <div className="h-full bg-emerald-300/85 transition-all duration-700" style={{ width: `${bar.friendly}%` }} />
                              </div>
                              <div className="h-3 bg-[#0b1114] border border-white/5">
                                <div className="h-full bg-[#7e8a93] transition-all duration-700" style={{ width: `${bar.opposing}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-4 text-[10px] uppercase tracking-[0.14em] text-[#7a868f] pt-1">
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-3 h-2 bg-emerald-300/85" /> {theater.friendly.label}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-3 h-2 bg-[#7e8a93]" /> {theater.opposing.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {expandedPanel === "sources" && (
                    <div className="space-y-4">
                      <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">Source stack</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {theater.sources.map((source) => (
                          <div key={source} className="border border-white/10 bg-[#050709] px-3 py-3 text-sm leading-6 text-[#c7d0d6]">
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

      {/* Manual copy fallback */}
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
