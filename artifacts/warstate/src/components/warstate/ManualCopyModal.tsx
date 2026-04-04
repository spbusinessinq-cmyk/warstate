interface ManualCopyModalProps {
  reportText: string;
  onClose: () => void;
}

export function ManualCopyModal({ reportText, onClose }: ManualCopyModalProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/92 p-4 md:p-8 flex items-center justify-center font-mono">
      <div className="w-full max-w-4xl border border-[#1e2d38] bg-[#06090c] shadow-[0_40px_120px_rgba(0,0,0,0.9)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#121e28] bg-[#050810] px-6 md:px-8 py-5">
          <div>
            <div className="text-[8px] uppercase tracking-[0.38em] text-[#3a4e5a] mb-3">Manual Copy Fallback</div>
            <h3 className="text-xl text-[#e2eaee] font-bold tracking-tight">Clipboard Access Blocked</h3>
            <p className="text-[10px] text-[#4e6472] mt-2 leading-5 uppercase tracking-[0.16em]">
              Select all text below and copy manually. Clipboard API restricted in this environment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 mt-1 px-4 py-2.5 border border-[#1e2d38] bg-[#050810] text-[9px] uppercase tracking-[0.24em] text-[#4e6472] hover:border-[#25364a] hover:text-[#7a8e9a] transition-colors whitespace-nowrap"
          >
            Close
          </button>
        </div>
        <div className="p-6 md:p-8">
          <textarea
            readOnly
            value={reportText}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="w-full h-[440px] bg-[#050810] border border-[#1e2d38] p-4 text-[12px] leading-6 text-[#7a8e9a] outline-none resize-none font-mono focus:border-[#265c42] transition-colors cursor-text"
          />
          <div className="mt-3 text-[9px] uppercase tracking-[0.24em] text-[#374650]">
            Click text area, then Ctrl+A / Cmd+A and copy
          </div>
        </div>
      </div>
    </div>
  );
}
