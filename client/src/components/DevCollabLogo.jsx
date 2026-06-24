import { Link } from "react-router-dom";

/**
 * Brand mark — always links to the homepage.
 */
const DevCollabLogo = ({ className = "" }) => {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${className}`}
      aria-label="DevCollab home"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-teal-900/40 shrink-0">
        D
      </div>
      <span className="text-lg font-semibold text-white tracking-tight">
        DevCollab
      </span>
    </Link>
  );
};

export default DevCollabLogo;
