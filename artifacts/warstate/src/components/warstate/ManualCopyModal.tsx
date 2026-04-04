interface ManualCopyModalProps {
  reportText: string;
  onClose: () => void;
}

export function ManualCopyModal({ reportText, onClose }: ManualCopyModalProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/82 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl border border-emerald-400/20 bg-[#05080a] shadow-[0_20px_80px_rgba(0,0,0,0.7)] overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-emerald-400/10 px-5 md:px-7 py-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300/65">Manual copy fallback</div>
            <h3 className="text-2xl mt-2 text-[#f2f5f7]">Clipboard access was blocked</h3>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 border border-white/10 bg-[#050709] text-xs uppercase tracking-[0.18em] hover:border-emerald-400/30 transition-colors"
          >
            Close
          </button>
        </div>
        <div className="p-5 md:p-7 space-y-4">
          <div className="text-[11px] leading-6 text-[#95a1aa]">
            Select all and copy this manually. The clipboard API may be restricted in certain environments — this fallback ensures the feature remains usable.
          </div>
          <textarea
            readOnly
            value={reportText}
            className="w-full h-[420px] bg-[#050709] border border-white/10 p-4 text-sm leading-6 text-[#d9dfe3] outline-none resize-none font-mono"
          />
        </div>
      </div>
    </div>
  );
}
