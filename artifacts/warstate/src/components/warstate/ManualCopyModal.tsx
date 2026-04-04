interface ManualCopyModalProps {
  reportText: string;
  onClose: () => void;
}

export function ManualCopyModal({ reportText, onClose }: ManualCopyModalProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/92 p-4 md:p-8 flex items-center justify-center font-mono">
      <div className="w-full max-w-4xl border border-[#1a2830] bg-[#070a0e] shadow-[0_28px_80px_rgba(0,0,0,0.85)] overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-[#111c24] px-6 md:px-7 py-5">
          <div>
            <div className="text-[9px] uppercase tracking-[0.32em] text-[#2e5c48] mb-3">Manual Copy Fallback</div>
            <h3 className="text-xl text-[#eef2f4] font-semibold">Clipboard Access Blocked</h3>
            <p className="text-[11px] text-[#52666e] mt-2 leading-5">
              Select all text below and copy manually. The clipboard API is restricted in this environment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-1 px-4 py-2 border border-[#1a2830] bg-[#060a0d] text-[10px] uppercase tracking-[0.22em] text-[#52666e] hover:border-[#1e3d2e] hover:text-[#8a9eaa] transition-colors whitespace-nowrap"
          >
            Close
          </button>
        </div>
        <div className="p-6 md:p-7">
          <textarea
            readOnly
            value={reportText}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="w-full h-[440px] bg-[#060a0d] border border-[#1a2830] p-4 text-sm leading-6 text-[#8a9eaa] outline-none resize-none font-mono focus:border-[#265c42] transition-colors cursor-text"
          />
          <div className="mt-3 text-[9px] uppercase tracking-[0.22em] text-[#364a56]">
            Click the text area to select all — then Ctrl+A / Cmd+A and copy
          </div>
        </div>
      </div>
    </div>
  );
}
