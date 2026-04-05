import {
  ReportSnapshot,
  DeltaAnalysis,
  parseCategory,
  REPORT_MODE_LABELS,
  buildDeltaAnalysis,
} from "@/lib/warstate-utils";

interface ReportModalProps {
  report: ReportSnapshot;
  exportingPdf: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  onExportTXT: () => void;
  onExportJSON: () => void;
  onCopyBrief: () => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[8px] uppercase tracking-[0.36em] text-[#4e6472] mb-3">{children}</div>
);

const SectionDivider = () => <div className="border-t border-[#121e28]" />;

const ModeBadge = ({ mode }: { mode: string }) => {
  const label = REPORT_MODE_LABELS[mode as keyof typeof REPORT_MODE_LABELS] ?? mode;
  const color =
    mode === "executive"  ? "border-[#1e3a4e] text-[#8abbd0]" :
    mode === "analyst"    ? "border-[#265c42] text-[#5ec998]" :
    mode === "escalation" ? "border-[#5c3a20] text-[#c8884e]" :
    "border-[#1e2d38] text-[#7a8e9a]";
  return (
    <span className={`border px-2 py-0.5 text-[8px] uppercase tracking-[0.22em] font-bold ${color}`}>
      {label}
    </span>
  );
};

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

// ── Shared section blocks ─────────────────────────────────────────────────────

function MetaStrip({ report }: { report: ReportSnapshot }) {
  return (
    <div className="border border-[#1e2d38] grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-[#1e2d38]">
      {[
        { label: "Theater",        val: <span className="text-[12px] text-[#c8d6de] font-semibold">{report.theater.short}</span> },
        { label: "Posture",        val: <span className="text-[12px] text-[#5ec998] font-semibold">{report.runtime.posture}</span> },
        { label: "Confidence",     val: <span className="text-[12px] text-[#c8d6de]">{report.runtime.confidence}</span> },
        { label: "Evidence",       val: <EvidenceBadge posture={report.theater.evidencePosture} /> },
        { label: "Source Breadth", val: (
          <span className={`text-[12px] font-semibold ${
            report.sourcePosture.breadth === "BROAD" ? "text-[#5ec998]" :
            report.sourcePosture.breadth === "MODERATE" ? "text-[#8abbd0]" : "text-[#c8884e]"
          }`}>{report.sourcePosture.breadth}</span>
        )},
        { label: "Report Mode",    val: <ModeBadge mode={report.mode} /> },
      ].map(({ label, val }) => (
        <div key={label} className="bg-[#050810] px-4 py-4">
          <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">{label}</div>
          {val}
        </div>
      ))}
    </div>
  );
}

function CurrentStatus({ report }: { report: ReportSnapshot }) {
  return (
    <div>
      <SectionLabel>Current Status</SectionLabel>
      <div className="border-l-2 border-[#1e2d38] pl-4">
        <p className="text-[13px] leading-7 text-[#9aaebb]">{report.runtime.currentStatus}</p>
      </div>
    </div>
  );
}

function EscalationDrivers({ report, limit }: { report: ReportSnapshot; limit?: number }) {
  const drivers = limit ? report.theater.escalationDrivers.slice(0, limit) : report.theater.escalationDrivers;
  return (
    <div>
      <SectionLabel>
        {limit ? `Primary Escalation Risks (Top ${limit})` : "Escalation Triggers"}
      </SectionLabel>
      <div className="space-y-2">
        {drivers.map((driver, idx) => {
          const { category, detail } = parseCategory(driver, 60);
          return (
            <div key={idx} className="flex gap-4 border border-[#1e2d38] bg-[#050810] px-4 py-3">
              <div className="text-[9px] font-bold text-[#374650] tabular-nums select-none mt-0.5 shrink-0 w-5">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div>
                {category && <div className="text-[8px] uppercase tracking-[0.24em] text-[#617888] mb-1">{category}</div>}
                <div className="text-[13px] leading-6 text-[#7a8e9a]">{detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WatchNext({ report, limit }: { report: ReportSnapshot; limit?: number }) {
  const items = limit ? report.theater.watchNext.slice(0, limit) : report.theater.watchNext;
  return (
    <div>
      <SectionLabel>{limit ? `Watch Priority (Top ${limit})` : "Watch Next"}</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="border border-[#1e2d38] bg-[#050810] px-3 py-3">
            <div className="text-[8px] uppercase tracking-[0.24em] text-[#374650] mb-2">Watch {idx + 1}</div>
            <div className="text-[12px] leading-5 text-[#7a8e9a]">{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Indicators({ report, limit }: { report: ReportSnapshot; limit?: number }) {
  const items = limit ? report.theater.indicators.slice(0, limit) : report.theater.indicators;
  return (
    <div>
      <SectionLabel>{limit ? `Risk Indicators (Top ${limit})` : "Priority Indicators"}</SectionLabel>
      <div className="space-y-2">
        {items.map((item, idx) => {
          const { category, detail } = parseCategory(item);
          return (
            <div key={idx} className="flex gap-4 border border-[#1e2d38] bg-[#050810] px-4 py-3">
              <div className="text-[9px] font-bold text-[#374650] tabular-nums select-none mt-0.5 shrink-0 w-5">{idx + 1}.</div>
              <div>
                {category && <div className="text-[8px] uppercase tracking-[0.24em] text-[#617888] mb-1.5">{category}</div>}
                <div className="text-[13px] leading-6 text-[#7a8e9a]">{detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BarsSection({ report }: { report: ReportSnapshot }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          <span className="flex items-center gap-2"><span className="inline-block w-4 h-1.5 bg-[#1c6348]" />{report.theater.friendly.label}</span>
          <span className="flex items-center gap-2"><span className="inline-block w-4 h-1.5 bg-[#374a56]" />{report.theater.opposing.label}</span>
        </div>
      </div>
    </div>
  );
}

function ForceLedger({ report }: { report: ReportSnapshot }) {
  return (
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
              <tr key={metric} className={`border-b border-[#121e28] last:border-0 ${idx % 2 === 0 ? "bg-[#050810]" : "bg-[#080c10]"}`}>
                <td className="px-4 py-3 text-[#c8d6de]">{metric}</td>
                <td className="px-4 py-3 text-[#7a8e9a]">{friendly}</td>
                <td className="px-4 py-3 text-[#7a8e9a]">{opposing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ForceSummary({ report }: { report: ReportSnapshot }) {
  const { friendly, opposing } = report.theater;
  return (
    <div>
      <SectionLabel>Force Posture Summary</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[{ f: friendly, label: "Friendly" }, { f: opposing, label: "Opposing" }].map(({ f, label }) => (
          <div key={label} className="border border-[#1e2d38] bg-[#050810] px-4 py-4">
            <div className="text-[8px] uppercase tracking-[0.24em] text-[#617888] mb-2">{f.label}</div>
            <div className="space-y-1.5">
              {[
                ["Equipment Losses", String(f.equipmentLosses)],
                ["Casualties (est)",  f.casualties],
                ["KIA (est)",         f.killed],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[11px]">
                  <span className="text-[#374650]">{k}</span>
                  <span className="text-[#7a8e9a] tabular-nums">{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceStack({ report }: { report: ReportSnapshot }) {
  return (
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
              {category && <div className="text-[8px] uppercase tracking-[0.26em] text-[#617888] mb-1.5">{category}</div>}
              <div className="text-[11px] leading-5 text-[#617888]">{detail}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SourcePostureBlock({ report }: { report: ReportSnapshot }) {
  const sp = report.sourcePosture;
  return (
    <div>
      <SectionLabel>Source Posture</SectionLabel>
      <div className="border border-[#1e2d38] bg-[#050810] px-4 py-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {[
            { label: `Breadth: ${sp.breadth}`, active: sp.breadth === "BROAD", warn: sp.breadth === "NARROW" },
            { label: `Strength: ${sp.strength}`, active: sp.strength === "HIGH", warn: sp.strength === "LOW" },
          ].map(({ label, active, warn }) => (
            <span key={label} className={`border px-2 py-1 text-[8px] uppercase tracking-[0.2em] font-semibold ${
              active ? "border-[#265c42] text-[#5ec998] bg-[#061018]" :
              warn   ? "border-[#5c3a20] text-[#c8884e] bg-[#080510]" :
              "border-[#1e3a4e] text-[#8abbd0] bg-[#050810]"
            }`}>{label}</span>
          ))}
          {sp.contradictionRisk && (
            <span className="border border-[#5c3a20] px-2 py-1 text-[8px] uppercase tracking-[0.2em] text-[#c8884e] bg-[#080510]">
              Adversarial sources present
            </span>
          )}
        </div>
        <p className="text-[12px] leading-6 text-[#617888]">{sp.summary}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {sp.categories.map((cat) => (
            <span key={cat} className="border border-[#1e2d38] px-2 py-0.5 text-[8px] uppercase tracking-[0.16em] text-[#374650]">{cat}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfidenceBlock({ report }: { report: ReportSnapshot }) {
  return (
    <>
      <div>
        <SectionLabel>Confidence Rationale</SectionLabel>
        <div className="border-l-2 border-[#1e2d38] pl-4">
          <p className="text-[13px] leading-7 text-[#617888]">{report.theater.confidenceRationale}</p>
        </div>
      </div>
      {report.theater.claimNotes.length > 0 && (
        <div>
          <SectionLabel>Contested / Claim Notes</SectionLabel>
          <div className="space-y-2">
            {report.theater.claimNotes.map((note, idx) => (
              <div key={idx} className="flex gap-4 border border-[#5c3a20] bg-[#080510] px-4 py-3">
                <div className="text-[9px] font-bold text-[#c8884e] tabular-nums select-none mt-0.5 shrink-0 w-5">{idx + 1}.</div>
                <div className="text-[12px] leading-6 text-[#9a7050]">{note}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function WhatChanged({ delta }: { delta: DeltaAnalysis }) {
  const fieldRows = [
    { label: "Posture",     changed: delta.postureChanged,    prev: delta.posturePrev,    curr: delta.postureCurr },
    { label: "Confidence",  changed: delta.confidenceChanged,  prev: delta.confidencePrev, curr: delta.confidenceCurr },
    { label: "Evidence",    changed: delta.evidenceChanged,    prev: delta.evidencePrev,   curr: delta.evidenceCurr },
  ];
  const movedSectors = delta.sectorDeltas.filter(s => s.direction !== "FLAT").sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return (
    <div>
      <SectionLabel>What Changed</SectionLabel>
      <div className="border border-[#1e2d38] bg-[#050810] p-4 space-y-4">

        {/* Analyst summary */}
        <div className="flex items-start gap-3">
          <div className={`mt-1 w-1.5 h-1.5 shrink-0 ${delta.anyChange ? "bg-[#c8884e]" : "bg-[#265c42]"}`} />
          <p className="text-[12px] leading-6 text-[#9aaebb]">{delta.analystSummary}</p>
        </div>

        {/* Cross-theater note */}
        {!delta.isSameTheater && (
          <div className="border border-[#5c3a20] bg-[#080510] px-3 py-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#c8884e]">
              Cross-theater comparison — prior snapshot was theater {delta.priorTheater}
            </span>
          </div>
        )}

        {/* Prior snapshot info */}
        <div className="text-[9px] text-[#374650] uppercase tracking-[0.18em]">
          Compared to: {delta.priorTheater} / {REPORT_MODE_LABELS[delta.priorMode]} / {delta.priorTimestamp}
        </div>

        {/* Field comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {fieldRows.map(({ label, changed, prev, curr }) => (
            <div key={label} className={`border px-3 py-3 ${changed ? "border-[#5c3a20]" : "border-[#1e2d38]"}`}>
              <div className="text-[8px] uppercase tracking-[0.24em] text-[#374650] mb-1.5">{label}</div>
              <div className="text-[11px] text-[#617888]">{prev}</div>
              <div className={`text-[11px] font-semibold mt-1 ${changed ? "text-[#c8884e]" : "text-[#5ec998]"}`}>
                {changed ? `→ ${curr}` : "Unchanged"}
              </div>
            </div>
          ))}
        </div>

        {/* Sector stress movement */}
        {movedSectors.length > 0 && (
          <div>
            <div className="text-[8px] uppercase tracking-[0.24em] text-[#374650] mb-2">Sector Stress Movement</div>
            <div className="space-y-1.5">
              {movedSectors.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-[10px] text-[#7a8e9a] uppercase tracking-[0.14em] w-28 shrink-0">{s.name}</span>
                  <div className="flex items-center gap-2 text-[10px] tabular-nums">
                    <span className="text-[#374650]">{s.prev}</span>
                    <span className={`font-bold ${s.direction === "UP" ? "text-[#c8884e]" : "text-[#5ec998]"}`}>
                      {s.direction === "UP" ? "↑" : "↓"} {Math.abs(s.delta)}
                    </span>
                    <span className="text-[#617888]">→ {s.curr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source posture shift note */}
        {delta.sourcePostureShift && (
          <div className="text-[10px] text-[#c8884e] pt-1 border-t border-[#121e28]">
            Source posture characteristics shifted since prior snapshot.
          </div>
        )}
      </div>
    </div>
  );
}

function ExportBar({ exportingPdf, onExportPDF, onExportTXT, onExportJSON, onCopyBrief }: {
  exportingPdf: boolean;
  onExportPDF: () => void;
  onExportTXT: () => void;
  onExportJSON: () => void;
  onCopyBrief: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-5 border-t border-[#1e2d38]">
      <button disabled={exportingPdf} onClick={onExportPDF}
        className="px-5 py-3 border border-[#265c42] bg-[#061018] text-[10px] uppercase tracking-[0.24em] text-[#5ec998] hover:bg-[#081420] hover:border-[#2f7050] disabled:opacity-40 transition-colors">
        {exportingPdf ? "Exporting..." : "Export PDF"}
      </button>
      <button onClick={onExportTXT}
        className="px-5 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.24em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] transition-colors">
        Export TXT
      </button>
      <button onClick={onExportJSON}
        className="px-5 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.24em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] transition-colors">
        Export JSON
      </button>
      <button onClick={onCopyBrief}
        className="px-5 py-3 border border-[#1e2d38] bg-[#050810] text-[10px] uppercase tracking-[0.24em] text-[#7a8e9a] hover:border-[#25364a] hover:text-[#c8d6de] transition-colors">
        Copy Brief
      </button>
    </div>
  );
}

// ── Mode-specific body renderers ──────────────────────────────────────────────

function ExecutiveBody({ report, delta, ...ex }: { report: ReportSnapshot; delta: DeltaAnalysis | null } & Omit<React.ComponentProps<typeof ExportBar>, "exportingPdf"> & { exportingPdf: boolean }) {
  const { exportingPdf, onExportPDF, onExportTXT, onExportJSON, onCopyBrief } = ex;
  const lead2 = report.theater.overview.split(". ").slice(0, 2).join(". ") + ".";
  return (
    <div className="space-y-7">
      {/* Compact meta — 4 cells only */}
      <div className="border border-[#1e2d38] grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-[#1e2d38]">
        {[
          { label: "Theater",    val: <span className="text-[12px] text-[#c8d6de] font-semibold">{report.theater.short}</span> },
          { label: "Posture",    val: <span className="text-[12px] text-[#5ec998] font-semibold">{report.runtime.posture}</span> },
          { label: "Confidence", val: <span className="text-[12px] text-[#c8d6de]">{report.runtime.confidence}</span> },
          { label: "Evidence",   val: <EvidenceBadge posture={report.theater.evidencePosture} /> },
        ].map(({ label, val }) => (
          <div key={label} className="bg-[#050810] px-4 py-4">
            <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">{label}</div>
            {val}
          </div>
        ))}
      </div>
      <SectionDivider />
      <CurrentStatus report={report} />
      <SectionDivider />
      <div>
        <SectionLabel>Situation</SectionLabel>
        <p className="text-[13px] leading-7 text-[#7a8e9a]">{lead2}</p>
      </div>
      <EscalationDrivers report={report} limit={2} />
      <WatchNext report={report} limit={2} />
      <SectionDivider />
      {/* Compact confidence + source note */}
      <div className="border border-[#1e2d38] bg-[#050810] px-4 py-4 space-y-2">
        <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-2">Confidence / Source Note</div>
        <div className="flex flex-wrap gap-2 mb-3">
          <EvidenceBadge posture={report.theater.evidencePosture} />
          <span className={`border px-2 py-0.5 text-[8px] uppercase tracking-[0.18em] font-semibold ${
            report.sourcePosture.breadth === "BROAD" ? "border-[#265c42] text-[#5ec998] bg-[#061018]" :
            report.sourcePosture.breadth === "MODERATE" ? "border-[#1e3a4e] text-[#8abbd0] bg-[#050810]" :
            "border-[#5c3a20] text-[#c8884e] bg-[#080510]"
          }`}>Sources: {report.sourcePosture.breadth}</span>
          {report.sourcePosture.contradictionRisk && (
            <span className="border border-[#5c3a20] px-2 py-0.5 text-[8px] uppercase tracking-[0.18em] text-[#c8884e] bg-[#080510]">Adversarial present</span>
          )}
        </div>
        <p className="text-[12px] leading-6 text-[#617888]">{report.theater.confidenceRationale}</p>
      </div>
      <ExportBar exportingPdf={exportingPdf} onExportPDF={onExportPDF} onExportTXT={onExportTXT} onExportJSON={onExportJSON} onCopyBrief={onCopyBrief} />
    </div>
  );
}

function AnalystBody({ report, delta, ...ex }: { report: ReportSnapshot; delta: DeltaAnalysis | null } & Omit<React.ComponentProps<typeof ExportBar>, "exportingPdf"> & { exportingPdf: boolean }) {
  const { exportingPdf, onExportPDF, onExportTXT, onExportJSON, onCopyBrief } = ex;
  return (
    <div className="space-y-7">
      <MetaStrip report={report} />
      <SectionDivider />
      <CurrentStatus report={report} />
      <SectionDivider />
      <div>
        <SectionLabel>Executive Overview</SectionLabel>
        <p className="text-[13px] leading-7 text-[#7a8e9a]">{report.theater.overview}</p>
      </div>
      <EscalationDrivers report={report} />
      <WatchNext report={report} />
      {delta && <><SectionDivider /><WhatChanged delta={delta} /></>}
      <SectionDivider />
      <BarsSection report={report} />
      <SectionDivider />
      <ForceLedger report={report} />
      <SectionDivider />
      <Indicators report={report} />
      <SectionDivider />
      <SourceStack report={report} />
      <SectionDivider />
      <SourcePostureBlock report={report} />
      <SectionDivider />
      <ConfidenceBlock report={report} />
      <ExportBar exportingPdf={exportingPdf} onExportPDF={onExportPDF} onExportTXT={onExportTXT} onExportJSON={onExportJSON} onCopyBrief={onCopyBrief} />
    </div>
  );
}

function EscalationBody({ report, delta, ...ex }: { report: ReportSnapshot; delta: DeltaAnalysis | null } & Omit<React.ComponentProps<typeof ExportBar>, "exportingPdf"> & { exportingPdf: boolean }) {
  const { exportingPdf, onExportPDF, onExportTXT, onExportJSON, onCopyBrief } = ex;
  return (
    <div className="space-y-7">
      <MetaStrip report={report} />
      <SectionDivider />
      {/* Escalation triggers lead */}
      <EscalationDrivers report={report} />
      {/* What changed comes early in escalation */}
      {delta && <><SectionDivider /><WhatChanged delta={delta} /></>}
      <SectionDivider />
      <Indicators report={report} limit={4} />
      <SectionDivider />
      <ForceSummary report={report} />
      <SectionDivider />
      <WatchNext report={report} />
      <SectionDivider />
      <SourcePostureBlock report={report} />
      <SectionDivider />
      <ConfidenceBlock report={report} />
      <ExportBar exportingPdf={exportingPdf} onExportPDF={onExportPDF} onExportTXT={onExportTXT} onExportJSON={onExportJSON} onCopyBrief={onCopyBrief} />
    </div>
  );
}

function DailyBody({ report, delta, ...ex }: { report: ReportSnapshot; delta: DeltaAnalysis | null } & Omit<React.ComponentProps<typeof ExportBar>, "exportingPdf"> & { exportingPdf: boolean }) {
  const { exportingPdf, onExportPDF, onExportTXT, onExportJSON, onCopyBrief } = ex;
  return (
    <div className="space-y-7">
      {/* Daily: compact 3-cell header */}
      <div className="border border-[#1e2d38] grid grid-cols-3 divide-x divide-[#1e2d38]">
        {[
          { label: "Theater",   val: <span className="text-[12px] text-[#c8d6de] font-semibold">{report.theater.short}</span> },
          { label: "Posture",   val: <span className="text-[12px] text-[#5ec998] font-semibold">{report.runtime.posture}</span> },
          { label: "Evidence",  val: <EvidenceBadge posture={report.theater.evidencePosture} /> },
        ].map(({ label, val }) => (
          <div key={label} className="bg-[#050810] px-4 py-4">
            <div className="text-[8px] uppercase tracking-[0.3em] text-[#4e6472] mb-1.5">{label}</div>
            {val}
          </div>
        ))}
      </div>
      <SectionDivider />
      {/* Status update leads */}
      <CurrentStatus report={report} />
      {/* Delta is front and center for daily */}
      {delta
        ? <><SectionDivider /><WhatChanged delta={delta} /></>
        : (
          <div className="border border-[#1e2d38] bg-[#050810] px-4 py-3">
            <div className="text-[9px] text-[#374650] uppercase tracking-[0.2em]">No prior snapshot — this is the first report in this session.</div>
          </div>
        )
      }
      <SectionDivider />
      <WatchNext report={report} limit={3} />
      <Indicators report={report} limit={3} />
      <SectionDivider />
      {/* Compact source note */}
      <div>
        <SectionLabel>Source Discipline Note</SectionLabel>
        <div className="border border-[#1e2d38] bg-[#050810] px-4 py-3 space-y-1.5">
          <p className="text-[12px] leading-6 text-[#617888]">{report.theater.sourceDiscipline}</p>
          <div className="flex gap-2 pt-1">
            <EvidenceBadge posture={report.theater.evidencePosture} />
            <span className={`border px-2 py-0.5 text-[8px] uppercase tracking-[0.18em] ${
              report.sourcePosture.contradictionRisk ? "border-[#5c3a20] text-[#c8884e]" : "border-[#1e2d38] text-[#374650]"
            }`}>{report.sourcePosture.contradictionRisk ? "Adversarial sources" : "No adversarial flags"}</span>
          </div>
        </div>
      </div>
      <ExportBar exportingPdf={exportingPdf} onExportPDF={onExportPDF} onExportTXT={onExportTXT} onExportJSON={onExportJSON} onCopyBrief={onCopyBrief} />
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function ReportModal({
  report,
  exportingPdf,
  onClose,
  onExportPDF,
  onExportTXT,
  onExportJSON,
  onCopyBrief,
}: ReportModalProps) {
  const delta = report.previousReport ? buildDeltaAnalysis(report, report.previousReport) : null;

  const bodyProps = { report, delta, exportingPdf, onExportPDF, onExportTXT, onExportJSON, onCopyBrief };

  return (
    <div className="fixed inset-0 z-50 bg-black/92 p-3 md:p-6 flex items-start justify-center font-mono overflow-y-auto">
      <div className="w-full max-w-5xl border border-[#1e2d38] bg-[#06090c] shadow-[0_40px_120px_rgba(0,0,0,0.9)] my-4">

        {/* ── Modal header ── */}
        <div className="border-b border-[#121e28] bg-[#050810] px-6 md:px-8 py-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[8px] uppercase tracking-[0.4em] text-[#3a4e5a] mb-3 flex items-center gap-3">
              <span className="inline-block w-1.5 h-1.5 bg-[#265c42]" />
              Locked Snapshot
              <span className="text-[#1e2d38]">//</span>
              <ModeBadge mode={report.mode} />
              {report.generatedAt && (
                <span className="text-[#374650]">{report.generatedAt}</span>
              )}
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

        {/* ── Mode-specific body ── */}
        <div className="p-6 md:p-8 max-h-[82vh] overflow-y-auto">
          {report.mode === "executive"  && <ExecutiveBody  {...bodyProps} />}
          {report.mode === "analyst"    && <AnalystBody    {...bodyProps} />}
          {report.mode === "escalation" && <EscalationBody {...bodyProps} />}
          {report.mode === "daily"      && <DailyBody      {...bodyProps} />}
        </div>
      </div>
    </div>
  );
}
