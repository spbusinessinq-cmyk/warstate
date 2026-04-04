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
    <div className="fixed inset-0 z-50 bg-black/85 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl border border-emerald-400/20 bg-[#05080a] shadow-[0_24px_80px_rgba(0,0,0,0.75)] overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between gap-4 border-b border-emerald-400/12 px-6 md:px-7 py-5">
          <div>
            <div className="text-[9px] uppercase tracking-[0.28em] text-emerald-300/60 mb-2">
              Generated Report Frame — Locked Snapshot
            </div>
            <h3 className="text-2xl text-[#f2f5f7]">{report.theater.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.2em] hover:border-emerald-400/30 transition-colors"
          >
            Close
          </button>
        </div>

        <div className="p-6 md:p-7 space-y-7 max-h-[78vh] overflow-y-auto">

          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 border border-white/10">
            <div className="bg-[#050709] px-4 py-4">
              <div className="text-[9px] uppercase tracking-[0.24em] text-[#6e7d87] mb-2">Product</div>
              <div className="text-sm">{report.theater.short} // {report.theater.codename}</div>
            </div>
            <div className="bg-[#050709] px-4 py-4">
              <div className="text-[9px] uppercase tracking-[0.24em] text-[#6e7d87] mb-2">Posture</div>
              <div className="text-sm text-emerald-300">{report.runtime.posture}</div>
            </div>
            <div className="bg-[#050709] px-4 py-4">
              <div className="text-[9px] uppercase tracking-[0.24em] text-[#6e7d87] mb-2">Confidence</div>
              <div className="text-sm">{report.runtime.confidence}</div>
            </div>
            <div className="bg-[#050709] px-4 py-4">
              <div className="text-[9px] uppercase tracking-[0.24em] text-[#6e7d87] mb-2">Last Refresh</div>
              <div className="text-sm">{report.runtime.lastUpdated}</div>
            </div>
          </div>

          {/* Current Status */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-3">Current Status</div>
            <p className="text-sm leading-7 text-[#c7d0d6]">{report.runtime.currentStatus}</p>
          </div>

          {/* Bar charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87]">
                Operational Stress Bars
              </div>
              {report.runtime.sectors.map((sector) => (
                <div key={sector.name}>
                  <div className="flex justify-between text-[11px] text-[#b8c2c8] mb-2 uppercase tracking-[0.14em]">
                    <span>{sector.name}</span>
                    <span className="tabular-nums">{sector.value}</span>
                  </div>
                  <div className="h-3 bg-[#0b1114] border border-white/5">
                    <div
                      className="h-full bg-emerald-300/85"
                      style={{ width: `${sector.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87]">
                Relative Comparison Bars
              </div>
              {report.trendBars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-[11px] text-[#b8c2c8] mb-2 uppercase tracking-[0.14em]">
                    <span>{bar.label}</span>
                    <span className="tabular-nums">{bar.friendly} / {bar.opposing}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 bg-[#0b1114] border border-white/5">
                      <div className="h-full bg-emerald-300/85" style={{ width: `${bar.friendly}%` }} />
                    </div>
                    <div className="h-3 bg-[#0b1114] border border-white/5">
                      <div className="h-full bg-[#7e8a93]" style={{ width: `${bar.opposing}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-5 text-[9px] uppercase tracking-[0.18em] text-[#6e7d87] pt-2 border-t border-white/5">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-2 bg-emerald-300/85" />
                  {report.theater.friendly.label}
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-2 bg-[#7e8a93]" />
                  {report.theater.opposing.label}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Overview */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-3">Executive Overview</div>
            <p className="text-sm leading-7 text-[#c7d0d6]">{report.theater.overview}</p>
          </div>

          {/* Priority Indicators */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-3">Priority Indicators</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.theater.indicators.map((item, idx) => (
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

          {/* Source Stack */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.28em] text-[#6e7d87] mb-3">Source Stack</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.theater.sources.map((source, idx) => (
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

          {/* Export actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/8">
            <button
              disabled={exportingPdf}
              onClick={onExportPDF}
              className="px-4 py-2.5 border border-emerald-300 bg-emerald-300/10 text-xs uppercase tracking-[0.2em] text-emerald-200 hover:bg-emerald-300/18 disabled:opacity-50 transition-colors"
            >
              {exportingPdf ? "Exporting..." : "Export PDF"}
            </button>
            <button
              onClick={onExportTXT}
              className="px-4 py-2.5 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.2em] hover:border-emerald-400/30 transition-colors"
            >
              Export TXT
            </button>
            <button
              onClick={onExportJSON}
              className="px-4 py-2.5 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.2em] hover:border-emerald-400/30 transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={onCopyBrief}
              className="px-4 py-2.5 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.2em] hover:border-emerald-400/30 transition-colors"
            >
              Copy Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
