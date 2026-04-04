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
    <div className="fixed inset-0 z-50 bg-black/82 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl border border-emerald-400/20 bg-[#05080a] shadow-[0_20px_80px_rgba(0,0,0,0.7)] overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-emerald-400/10 px-5 md:px-7 py-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/65">Generated report frame</div>
            <h3 className="text-2xl mt-2 text-[#f2f5f7]">{report.theater.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 transition-colors"
          >
            Close
          </button>
        </div>

        <div className="p-5 md:p-7 space-y-6 max-h-[78vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10">
            <div className="bg-[#050709] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a868f]">Product</div>
              <div className="mt-2 text-sm">{report.theater.short} // {report.theater.codename}</div>
            </div>
            <div className="bg-[#050709] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a868f]">Posture</div>
              <div className="mt-2 text-sm text-emerald-300">{report.runtime.posture}</div>
            </div>
            <div className="bg-[#050709] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a868f]">Confidence</div>
              <div className="mt-2 text-sm">{report.runtime.confidence}</div>
            </div>
            <div className="bg-[#050709] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a868f]">Last Refresh</div>
              <div className="mt-2 text-sm">{report.runtime.lastUpdated}</div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">Current status</div>
            <p className="mt-3 text-sm leading-7 text-[#c7d0d6]">{report.runtime.currentStatus}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f] mb-3">Operational stress bars</div>
              <div className="space-y-3">
                {report.runtime.sectors.map((sector) => (
                  <div key={sector.name}>
                    <div className="flex justify-between text-[11px] text-[#b8c2c8] mb-2 uppercase tracking-[0.14em]">
                      <span>{sector.name}</span>
                      <span>{sector.value}</span>
                    </div>
                    <div className="h-3 bg-[#0b1114] border border-white/5">
                      <div className="h-full bg-emerald-300/85 transition-all duration-700" style={{ width: `${sector.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f] mb-3">Relative comparison bars</div>
              <div className="space-y-3">
                {report.trendBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-[11px] text-[#b8c2c8] mb-2 uppercase tracking-[0.14em]">
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
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">Executive overview</div>
            <p className="mt-3 text-sm leading-7 text-[#c7d0d6]">{report.theater.overview}</p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a868f]">Priority indicators</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.theater.indicators.map((item) => (
                <div key={item} className="border border-white/10 bg-[#050709] px-3 py-3 text-sm leading-6 text-[#c7d0d6]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            <button
              disabled={exportingPdf}
              onClick={onExportPDF}
              className="px-3 py-2 border border-emerald-300 bg-emerald-300/10 text-xs uppercase tracking-[0.18em] text-emerald-200 disabled:opacity-60 transition-colors"
            >
              {exportingPdf ? "Exporting..." : "Export PDF"}
            </button>
            <button onClick={onExportTXT} className="px-3 py-2 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 transition-colors">
              Export TXT
            </button>
            <button onClick={onExportJSON} className="px-3 py-2 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 transition-colors">
              Export JSON
            </button>
            <button onClick={onCopyBrief} className="px-3 py-2 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 transition-colors">
              Copy Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
