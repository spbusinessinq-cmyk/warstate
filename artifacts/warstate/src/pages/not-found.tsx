export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020405] text-[#d9dfe3] font-mono flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-[10px] uppercase tracking-[0.34em] text-emerald-300/65">WARSTATE // 404</div>
        <h1 className="text-4xl font-semibold">PAGE NOT FOUND</h1>
        <p className="text-sm text-[#8f9aa3]">The requested grid does not exist.</p>
        <a href="/" className="inline-block mt-4 px-4 py-2 border border-emerald-300 bg-emerald-300/10 text-xs uppercase tracking-[0.18em] text-emerald-200">
          Return to Grid
        </a>
      </div>
    </div>
  );
}
