import { ReportSnapshot } from "@/lib/warstate-utils";

interface ReportModalProps {
  report: ReportSnapshot;
  exportingPdf: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  onExportTXT: () => void;
  onExportJSON: () => void;
  onCopyBrief: () => void;
}

export function ReportModal({
  report,
  exportingPdf,
  onClose,
  onExportPDF,
  onExportTXT,
  onExportJSON,
  onCopyBrief,
}: ReportModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 p-4 md:p-8 flex items-center justify-center font-mono">
      <div className="w-full max-w-5xl border border-[#1a2830] bg-[#070a0e] shadow-[0_28px_80px_rgba(0,0,0,0.85)] overflow-hidden">

        {/* ── Modal header ── */}
        <div className="flex items-start justify-between gap-4 border-b border-[#111c24] px-6 md:px-7 py-5">
          <div>
            <div className="text-[9px] uppercase tracking-[0.32em] text-[#2e5c48] mb-3">
              Generated Report &nbsp;//&nbsp; Locked Snapshot
            </div>
            <h3 className="text-2xl text-[#eef2f4] font-semibold">{report.theater.title}</h3>
            <div className="text-[10px] text-[#52666e] uppercase tracking-[0.2em] mt-1">
              {report.theater.codename} &nbsp;//&nbsp; {report.runtime.lastUpdated}
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-1 px-4 py-2 border border-[#1a2830] bg-[#060a0d] text-[10px] uppercase tracking-[0.22em] text-[#52666e] hover:border-[#1e3d2e] hover:text-[#8a9eaa] transition-colors"
          >
            Close
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="p-6 md:p-7 space-y-7 max-h-[80vh] overflow-y-auto">

          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#111c24] border border-[#1a2830]">
            <div className="bg-[#060a0d] px-4 py-4">
              <div className="text-[9px] uppercase tracking-[0.26em] text-[#52666e] mb-2">Theater</div>
              <div className="text-sm text-[#c4d0d8]">{report.theater.short}</div>
            </div>
            <div className="bg-[#060a0d] px-4 py-4">
              <div className="text-[9px] uppercase tracking-[0.26em] text-[#52666e] mb-2">Posture</div>
              <div className="text-sm text-[#4caf87]">{report.runtime.posture}</div>
            </div>
            <div className="bg-[#060a0d] px-4 py-4">
              <div className="text-[9px] uppercase tracking-[0.26em] text-[#52666e] mb-2">Confidence</div>
              <div className="text-sm text-[#c4d0d8]">{report.runtime.confidence}</div>
            </div>
            <div className="bg-[#060a0d] px-4 py-4">
              <div className="text-[9px] uppercase tracking-[0.26em] text-[#52666e] mb-2">Classification</div>
              <div className="text-sm text-[#c4d0d8]">{report.theater.classification}</div>
            </div>
          </div>

          {/* Current Status */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e] mb-3">Current Status</div>
            <p className="text-sm leading-7 text-[#8a9eaa]">{report.runtime.currentStatus}</p>
          </div>

          {/* Bar charts — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sector stress */}
            <div className="space-y-4">
              <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">Sector Stress Index</div>
              {report.runtime.sectors.map((sector) => (
                <div key={sector.name}>
                  <div className="flex justify-between text-[11px] text-[#8a9eaa] mb-2 uppercase tracking-[0.14em]">
                    <span>{sector.name}</span>
                    <span className="tabular-nums text-[#52666e]">{sector.value}</span>
                  </div>
                  <div className="h-2.5 bg-[#0a1214] border border-[#1a2830]">
                    <div
                      className="h-full bg-[#1c6348]"
                      style={{ width: `${sector.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison bars */}
            <div className="space-y-4">
              <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e]">Relative Attrition</div>
              {report.trendBars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-[11px] text-[#8a9eaa] mb-2 uppercase tracking-[0.14em]">
                    <span>{bar.label}</span>
                    <span className="tabular-nums text-[#52666e]">{bar.friendly} / {bar.opposing}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2.5 bg-[#0a1214] border border-[#1a2830]">
                      <div className="h-full bg-[#1c6348]" style={{ width: `${bar.friendly}%` }} />
                    </div>
                    <div className="h-2.5 bg-[#0a1214] border border-[#1a2830]">
                      <div className="h-full bg-[#374a56]" style={{ width: `${bar.opposing}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-5 text-[9px] uppercase tracking-[0.18em] text-[#364a56] pt-3 border-t border-[#111c24]">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-1.5 bg-[#1c6348]" />
                  {report.theater.friendly.label}
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-1.5 bg-[#374a56]" />
                  {report.theater.opposing.label}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Overview */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e] mb-3">Executive Overview</div>
            <p className="text-sm leading-7 text-[#8a9eaa]">{report.theater.overview}</p>
          </div>

          {/* Force Ledger */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e] mb-3">Force Ledger</div>
            <div className="border border-[#1a2830] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#060a0d] border-b border-[#1a2830]">
                  <tr>
                    <th className="text-left px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-[#52666e] font-medium">Metric</th>
                    <th className="text-left px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-[#52666e] font-medium">{report.theater.friendly.label}</th>
                    <th className="text-left px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-[#52666e] font-medium">{report.theater.opposing.label}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.comparisonRows.map(([metric, friendly, opposing], idx) => (
                    <tr
                      key={metric}
                      className={`border-b border-[#111c24] last:border-0 ${idx % 2 === 0 ? "bg-[#060a0d]" : "bg-[#080e0b]"}`}
                    >
                      <td className="px-4 py-3 text-[#c4d0d8]">{metric}</td>
                      <td className="px-4 py-3 text-[#8a9eaa]">{friendly}</td>
                      <td className="px-4 py-3 text-[#8a9eaa]">{opposing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Priority Indicators */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e] mb-3">Priority Indicators</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.theater.indicators.map((item, idx) => (
                <div
                  key={item}
                  className="border border-[#111c24] bg-[#060a0d] px-4 py-3 text-sm leading-6 text-[#8a9eaa]"
                >
                  <span className="text-[#364a56] text-[10px] tracking-[0.14em] mr-2 select-none">{idx + 1}.</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Source Stack */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-[#52666e] mb-3">Source Stack</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.theater.sources.map((source, idx) => (
                <div
                  key={source}
                  className="border border-[#111c24] bg-[#060a0d] px-4 py-3 text-sm leading-6 text-[#8a9eaa]"
                >
                  <span className="text-[#364a56] text-[10px] tracking-[0.14em] mr-2 select-none">{idx + 1}.</span>
                  {source}
                </div>
              ))}
            </div>
          </div>

          {/* Export actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-[#111c24]">
            <button
              disabled={exportingPdf}
              onClick={onExportPDF}
              className="px-5 py-3 border border-[#265c42] bg-[#071812] text-[11px] uppercase tracking-[0.22em] text-[#5ec998] hover:bg-[#0a2018] disabled:opacity-50 transition-colors"
            >
              {exportingPdf ? "Exporting..." : "Export PDF"}
            </button>
            <button
              onClick={onExportTXT}
              className="px-5 py-3 border border-[#1a2830] bg-[#060a0d] text-[11px] uppercase tracking-[0.22em] text-[#8a9eaa] hover:border-[#1e3d2e] hover:text-[#c4d0d8] transition-colors"
            >
              Export TXT
            </button>
            <button
              onClick={onExportJSON}
              className="px-5 py-3 border border-[#1a2830] bg-[#060a0d] text-[11px] uppercase tracking-[0.22em] text-[#8a9eaa] hover:border-[#1e3d2e] hover:text-[#c4d0d8] transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={onCopyBrief}
              className="px-5 py-3 border border-[#1a2830] bg-[#060a0d] text-[11px] uppercase tracking-[0.22em] text-[#8a9eaa] hover:border-[#1e3d2e] hover:text-[#c4d0d8] transition-colors"
            >
              Copy Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
