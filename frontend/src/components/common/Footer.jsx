export function Footer() {
  return (
    <footer className="mt-auto py-6 px-8 border-t border-slate-900 bg-slate-950/20 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <span>© 2026 Smart Energy AI Console. All rights reserved.</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-400">All local nodes online</span>
        </div>
        <span className="text-slate-600">|</span>
        <span>v1.0.4 (Beta)</span>
      </div>
    </footer>
  );
}
export default Footer;
