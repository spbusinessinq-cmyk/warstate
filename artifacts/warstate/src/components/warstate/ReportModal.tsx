import { ReportSnapshot, parseCategory, REPORT_MODE_LABELS } from "@/lib/warstate-utils";

interface ReportModalProps {
  report: ReportSnapshot;
  exportingPdf: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  onExportTXT: () => void;
  onExportJSON: () => void;
  onCopyBrief: () => void;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[8px] uppercase tracking-[0.36em] text-[#4e6472] mb-3">{children}</div>
);

const SectionDivider = () => (
  <div className="border-t border-[#121e28]" />
);

const EvidenceBadge = ({ posture }: { posture: string }) => {
  const color =
    posture === "CONFIRMED" ? "border-[#265c42] text-[#5ec998] bg-[#061018]" :
    posture === "LIKELY"    ? "border-[#1e3a4e] text-[#8abbd0] bg-[#050810]" :
    posture === "CONTESTED" ? "border-[#5c3a20] text-[#c8884e] bg-[#080510]" :
    "border-[#1e2d38] text-[#7a8e9a] bg-[#050810]";
  return (
    <span className={`border px-2 py-0.5 text-[8px] uppercase tracking-[0.22em] font-bold ${color}`}>
      {posture}
    </span>
  );
};

export function ReportModal({
  report,
  exportingPdf,
  onClose,
  onExportPDF,
  onExportTXT,
  onExportJSON,
  onCopyBrief,
}: ReportModalProps) {
  const hasPreviousReport = !!report.previousReport;
  const sameTheaterDelta = hasPreviousReport && report.previousReport!.theater.id === report.theater.id;

  return (
    <div className="fixed inset-0 z-50 bg-black/92 p-3 md:p-6 flex items-start justify-center font-mono overflow-y-auto">
      <div className="w-full max-w-5xl border border-[#1e2d38] bg-[#06090c] shadow-[0_40px_120px_rgba(0,0,0,0.9)] my-4">

        {/* ── Modal header ── */}
        <div className="border-b border-[#121e28] bg-[#050810] px-6 md:px-8 py-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[8px] uppercase tracking-[0.4em] text-[#3a4e5a] mb-3 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-[#265c42]" />
              Generated Report &nbsp;//&nbsp; Locked Snapshot &nbsp;//&nbsp;
              <span className="text-[#4e6472]">{REPORT_MODE_LABELS[report.mode]}</span>
            </div>
            <h3 className="text-2xl text-[#e2eaee] font-bold tracking-tight">{report.theater.title}</h3>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-[10px] text-[#4e6472] uppercase tracking-[0.24em]">
                {report.theater.codename} &nbsp;//&nbsp; {report.runtime.posture} &nbsp;//&nbsp; {report.runtime.lastUpdated}
              </div>
              <EvidenceBadge posture={report.theater.evidencePosture} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 mt-1 px-4 py-2.5 border border-[#1e2d38] bg-[#050810] text-[9px] uppercase tracking-[0.24em] text-[#4e6472] hover:border-[#25364a] hover:text-[#7a8e9a] transition-colors"
          >
            Close
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="p-6 md:p-8 space-y-7 max-h-[82vh] overflow-y-auto">

          {/* Metadata strip — 3 cols × 2 rows */}
          <div className="border border-[#1e2d38] grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-[#1e2d38]">
            <div className="bg-[#050810] px-4 py-4">
              <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">Theater</div>
              <div className="text-[12px] text-[#c8d6de] font-semibold">{report.theater.short}</div>
            </div>
            <div className="bg-[#050810] px-4 py-4">
              <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">Posture</div>
              <div className="text-[12px] text-[#5ec998] font-semibold">{report.runtime.posture}</div>
            </div>
            <div className="bg-[#050810] px-4 py-4">
              <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">Confidence</div>
              <div className="text-[12px] text-[#c8d6de]">{report.runtime.confidence}</div>
            </div>
            <div className="bg-[#050810] px-4 py-4">
              <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">Evidence Posture</div>
              <EvidenceBadge posture={report.theater.evidencePosture} />
            </div>
            <div className="bg-[#050810] px-4 py-4">
              <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">Source Breadth</div>
              <div className={`text-[12px] font-semibold ${
                report.sourcePosture.breadth === "BROAD"    ? "text-[#5ec998]" :
                report.sourcePosture.breadth === "MODERATE" ? "text-[#8abbd0]" :
                "text-[#c8884e]"
              }`}>{report.sourcePosture.breadth}</div>
            </div>
            <div className="bg-[#050810] px-4 py-4">
              <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">Report Mode</div>
              <div className="text-[11px] text-[#617888]">{REPORT_MODE_LABELS[report.mode]}</div>
            </div>
          </div>

          <SectionDivider />

          {/* Current Status */}
          <div>
            <SectionLabel>Current Status</SectionLabel>
            <div className="border-l-2 border-[#1e2d38] pl-4">
              <p className="text-[13px] leading-7 text-[#9aaebb]">{report.runtime.currentStatus}</p>
            </div>
          </div>

          <SectionDivider />

          {/* Executive Overview */}
          <div>
            <SectionLabel>Executive Overview</SectionLabel>
            <p className="text-[13px] leading-7 text-[#7a8e9a]">{report.theater.overview}</p>
          </div>

          {/* Escalation Drivers */}
          <div>
            <SectionLabel>Escalation Drivers</SectionLabel>
            <div className="space-y-2">
              {report.theater.escalationDrivers.map((driver, idx) => {
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
            <SectionLabel>Watch Next</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {report.theater.watchNext.map((item, idx) => (
                <div key={idx} className="border border-[#1e2d38] bg-[#050810] px-3 py-3">
                  <div className="text-[8px] uppercase tracking-[0.24em] text-[#374650] mb-2">Watch {idx + 1}</div>
                  <div className="text-[12px] leading-5 text-[#7a8e9a]">{item}</div>
                </div>
              ))}
            </div>
          </div>

          {/* What Changed — only if prior snapshot exists */}
          {hasPreviousReport && (
            <>
              <SectionDivider />
              <div>
                <SectionLabel>What Changed</SectionLabel>
                <div className="border border-[#1e2d38] bg-[#050810] p-4 space-y-3">
                  <div className="text-[9px] text-[#374650] uppercase tracking-[0.22em] mb-2">
                    Compared to snapshot from {report.previousReport!.runtime.lastUpdated}
                    {!sameTheaterDelta && (
                      <span className="ml-2 text-[#c8884e]">
                        &mdash; different theater ({report.previousReport!.theater.short})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { label: "Posture",    prev: report.previousReport!.runtime.posture,   curr: report.runtime.posture },
                      { label: "Confidence", prev: report.previousReport!.runtime.confidence, curr: report.runtime.confidence },
                      { label: "Evidence",   prev: report.previousReport!.theater.evidencePosture, curr: report.theater.evidencePosture },
                    ].map(({ label, prev, curr }) => {
                      const changed = prev !== curr;
                      return (
                        <div key={label} className={`border px-3 py-3 ${changed ? "border-[#5c3a20]" : "border-[#1e2d38]"}`}>
                          <div className="text-[8px] uppercase tracking-[0.24em] text-[#374650] mb-1.5">{label}</div>
                          <div className="text-[11px] text-[#617888]">{prev}</div>
                          <div className={`text-[11px] font-semibold mt-1 ${changed ? "text-[#c8884e]" : "text-[#5ec998]"}`}>
                            {changed ? `→ ${curr}` : "Unchanged"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-[#374650] leading-5 pt-1 border-t border-[#121e28]">
                    Review sector stress bars for current vs. prior pressure values.
                  </div>
                </div>
              </div>
            </>
          )}

          <SectionDivider />

          {/* Bar charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Sector Stress */}
            <div>
              <SectionLabel>Sector Stress Index</SectionLabel>
              <div className="space-y-4">
                {report.runtime.sectors.map((sector) => (
                  <div key={sector.name}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[10px] text-[#7a8e9a] uppercase tracking-[0.16em]">{sector.name}</span>
                      <span className="text-[11px] tabular-nums text-[#4e6472] font-bold">{sector.value}</span>
                    </div>
                    <div className="h-2 bg-[#050810] border border-[#1e2d38]">
                      <div className="h-full bg-[#1c6348]" style={{ width: `${sector.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Relative Attrition */}
            <div>
              <SectionLabel>Relative Attrition</SectionLabel>
              <div className="space-y-4">
                {report.trendBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[10px] text-[#7a8e9a] uppercase tracking-[0.16em]">{bar.label}</span>
                      <span className="text-[10px] tabular-nums text-[#374650]">{bar.friendly} / {bar.opposing}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-[#050810] border border-[#1e2d38]">
                        <div className="h-full bg-[#1c6348]" style={{ width: `${bar.friendly}%` }} />
                      </div>
                      <div className="h-2 bg-[#050810] border border-[#1e2d38]">
                        <div className="h-full bg-[#374a56]" style={{ width: `${bar.opposing}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-6 text-[8px] uppercase tracking-[0.2em] text-[#374650] mt-5 pt-4 border-t border-[#121e28]">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-1.5 bg-[#1c6348]" />
                  {report.theater.friendly.label}
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-1.5 bg-[#374a56]" />
                  {report.theater.opposing.label}
                </span>
              </div>
            </div>
          </div>

          <SectionDivider />

          {/* Force Ledger */}
          <div>
            <SectionLabel>Force Ledger</SectionLabel>
            <div className="border border-[#1e2d38] overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-[#050810] border-b border-[#1e2d38]">
                  <tr>
                    <th className="text-left px-4 py-3 text-[8px] uppercase tracking-[0.24em] text-[#4e6472] font-medium">Metric</th>
                    <th className="text-left px-4 py-3 text-[8px] uppercase tracking-[0.24em] text-[#4e6472] font-medium">{report.theater.friendly.label}</th>
                    <th className="text-left px-4 py-3 text-[8px] uppercase tracking-[0.24em] text-[#4e6472] font-medium">{report.theater.opposing.label}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.comparisonRows.map(([metric, friendly, opposing], idx) => (
                    <tr
                      key={metric}
                      className={`border-b border-[#121e28] last:border-0 ${idx % 2 === 0 ? "bg-[#050810]" : "bg-[#080c10]"}`}
                    >
                      <td className="px-4 py-3 text-[#c8d6de]">{metric}</td>
                      <td className="px-4 py-3 text-[#7a8e9a]">{friendly}</td>
                      <td className="px-4 py-3 text-[#7a8e9a]">{opposing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <SectionDivider />

          {/* Priority Indicators */}
          <div>
            <SectionLabel>Priority Indicators</SectionLabel>
            <div className="space-y-2">
              {report.theater.indicators.map((item, idx) => {
                const { category, detail } = parseCategory(item);
                return (
                  <div key={idx} className="flex gap-4 border border-[#1e2d38] bg-[#050810] px-4 py-3">
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

          <SectionDivider />

          {/* Source Stack */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <SectionLabel>Source Stack</SectionLabel>
              <div className="flex-1 border-t border-[#121e28]" />
              <div className="text-[8px] uppercase tracking-[0.22em] text-[#374650] mb-3 tabular-nums">{report.theater.sources.length} cat.</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.theater.sources.map((src, idx) => {
                const { category, detail } = parseCategory(src, 50);
                return (
                  <div key={idx} className="border border-[#1e2d38] bg-[#050810] px-4 py-3">
                    {category && (
                      <div className="text-[8px] uppercase tracking-[0.26em] text-[#617888] mb-1.5">{category}</div>
                    )}
                    <div className="text-[11px] leading-5 text-[#617888]">{detail}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <SectionDivider />

          {/* Source Posture */}
          <div>
            <SectionLabel>Source Posture</SectionLabel>
            <div className="border border-[#1e2d38] bg-[#050810] px-4 py-4 space-y-3">
              <div className="flex flex-wrap gap-3">
                <span className={`border px-2 py-1 text-[8px] uppercase tracking-[0.2em] font-semibold ${
                  report.sourcePosture.breadth === "BROAD"    ? "border-[#265c42] text-[#5ec998] bg-[#061018]" :
                  report.sourcePosture.breadth === "MODERATE" ? "border-[#1e3a4e] text-[#8abbd0] bg-[#050810]" :
                  "border-[#5c3a20] text-[#c8884e] bg-[#080510]"
                }`}>
                  Breadth: {report.sourcePosture.breadth}
                </span>
                <span className={`border px-2 py-1 text-[8px] uppercase tracking-[0.2em] font-semibold ${
                  report.sourcePosture.strength === "HIGH"     ? "border-[#265c42] text-[#5ec998] bg-[#061018]" :
                  report.sourcePosture.strength === "MODERATE" ? "border-[#1e3a4e] text-[#8abbd0] bg-[#050810]" :
                  "border-[#5c3a20] text-[#c8884e] bg-[#080510]"
                }`}>
                  Strength: {report.sourcePosture.strength}
                </span>
                {report.sourcePosture.contradictionRisk && (
                  <span className="border border-[#5c3a20] px-2 py-1 text-[8px] uppercase tracking-[0.2em] text-[#c8884e] bg-[#080510]">
                    Adversarial sources present
                  </span>
                )}
              </div>
              <p className="text-[12px] leading-6 text-[#617888]">{report.sourcePosture.summary}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {report.sourcePosture.categories.map((cat) => (
                  <span key={cat} className="border border-[#1e2d38] px-2 py-0.5 text-[8px] uppercase tracking-[0.16em] text-[#374650]">{cat}</span>
                ))}
              </div>
            </div>
          </div>

          <SectionDivider />

          {/* Confidence Rationale */}
          <div>
            <SectionLabel>Confidence Rationale</SectionLabel>
            <div className="border-l-2 border-[#1e2d38] pl-4">
              <p className="text-[13px] leading-7 text-[#617888]">{report.theater.confidenceRationale}</p>
            </div>
          </div>

          {/* Claim Notes */}
          {report.theater.claimNotes.length > 0 && (
            <div>
              <SectionLabel>Contested / Claim Notes</SectionLabel>
              <div className="space-y-2">
                {report.theater.claimNotes.map((note, idx) => (
                  <div key={idx} className="flex gap-4 border border-[#5c3a20] bg-[#080510] px-4 py-3">
                    <div className="text-[9px] font-bold text-[#c8884e] tabular-nums select-none mt-0.5 shrink-0 w-5">
                      {idx + 1}.
                    </div>
                    <div className="text-[12px] leading-6 text-[#9a7050]">{note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export actions */}
          <div className="flex flex-wrap gap-2 pt-5 border-t border-[#1e2d38]">
            <button
              disabled={exportingPdf}
              onClick={onExportPDF}
              className="px-5 py-3 border border-[#265c42] bg-[#061018] text-[10px] uppercase tracking-[0.24em] text-[#5ec998] hover:bg-[#081420] hover:border-[#2f7050] disabled:opacity-40 transition-colors"
            >
              {exportingPdf ? "Exporting..." : "Export PDF"}
            </button>
            <button
              onClick={onExportTXT}
              className="px-5 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.24em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] transition-colors"
            >
              Export TXT
            </button>
            <button
              onClick={onExportJSON}
              className="px-5 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.24em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={onCopyBrief}
              className="px-5 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.24em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] transition-colors"
            >
              Copy Brief
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
