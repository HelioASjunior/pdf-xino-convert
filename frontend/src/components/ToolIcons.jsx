/**
 * ToolIcons.jsx — Custom SVG icons per tool function, iLovePDF-style.
 * Each icon: 44×44 px · pastel category background · bold operation symbol.
 * Dark mode: backgrounds dim slightly; doc shapes stay visible via Tailwind fill utilities.
 */

// ─── PDF tools (red palette) ────────────────────────────────

export function MergePdfIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-red-100 dark:fill-red-900/40" />
      <rect x="4" y="11" width="12" height="16" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <rect x="28" y="11" width="12" height="16" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <path d="M17.5 19h9" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
      <path d="M23.5 16l3 3-3 3" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="15" y="31" width="14" height="3.5" rx="1.75" fill="#EF4444" />
    </svg>
  );
}

export function SplitPdfIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-red-100 dark:fill-red-900/40" />
      <rect x="11" y="9" width="17" height="23" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <path d="M11 20.5h17" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2.5" strokeLinecap="round" />
      <path d="M34 14v6" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      <path d="M31.5 16.5l2.5-2.5 2.5 2.5" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 24v6" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      <path d="M31.5 27.5l2.5 2.5 2.5-2.5" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CompressPdfIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-red-100 dark:fill-red-900/40" />
      <rect x="10" y="9" width="17" height="23" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <rect x="13.5" y="16" width="10" height="1.5" rx=".75" className="fill-red-200 dark:fill-red-300/50" />
      <rect x="13.5" y="19.5" width="10" height="1.5" rx=".75" className="fill-red-200 dark:fill-red-300/50" />
      <rect x="13.5" y="23" width="7" height="1.5" rx=".75" className="fill-red-200 dark:fill-red-300/50" />
      <path d="M33 9v7" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
      <path d="M30.5 13.5l2.5 2.5 2.5-2.5" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33 25v7" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
      <path d="M30.5 27.5l2.5-2.5 2.5 2.5" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PdfToWordIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-blue-100 dark:fill-blue-900/40" />
      <rect x="3" y="12" width="14" height="18" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <rect x="6" y="18" width="8" height="1.5" rx=".75" className="fill-blue-200 dark:fill-blue-300/50" />
      <rect x="6" y="21" width="8" height="1.5" rx=".75" className="fill-blue-200 dark:fill-blue-300/50" />
      <rect x="6" y="24" width="5" height="1.5" rx=".75" className="fill-blue-200 dark:fill-blue-300/50" />
      <path d="M18.5 21h6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 18.5l2.5 2.5-2.5 2.5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="25.5" y="12" width="15" height="18" rx="2" className="fill-blue-700 dark:fill-blue-600" />
      <path d="M28 17l2.5 8 2-4 2 4 2.5-8" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function PdfToImagesIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-amber-100 dark:fill-amber-900/40" />
      <rect x="3" y="12" width="14" height="18" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <rect x="6" y="17.5" width="8" height="1.5" rx=".75" className="fill-amber-200 dark:fill-amber-300/50" />
      <rect x="6" y="21" width="8" height="1.5" rx=".75" className="fill-amber-200 dark:fill-amber-300/50" />
      <path d="M18.5 21h6" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 18.5l2.5 2.5-2.5 2.5" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="25.5" y="12" width="15" height="18" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <path d="M27 28l3.5-5.5 3 3.5 2-3 4.5 5H27z" fill="#FDE68A" clipPath="url(#img-clip)" />
      <clipPath id="img-clip">
        <rect x="25.5" y="12" width="15" height="18" rx="2" />
      </clipPath>
      <circle cx="37" cy="15.5" r="2" fill="#F59E0B" />
    </svg>
  );
}

export function RotatePdfIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-emerald-100 dark:fill-emerald-900/40" />
      <rect x="13" y="10" width="15" height="21" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <rect x="16.5" y="16" width="8" height="1.5" rx=".75" className="fill-emerald-200 dark:fill-emerald-300/50" />
      <rect x="16.5" y="19.5" width="8" height="1.5" rx=".75" className="fill-emerald-200 dark:fill-emerald-300/50" />
      <rect x="16.5" y="23" width="5" height="1.5" rx=".75" className="fill-emerald-200 dark:fill-emerald-300/50" />
      <path d="M9 20 A13 11 0 0 1 35 20" stroke="#059669" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M32 16.5l3 3.5-4.5.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function RemovePagesIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-rose-100 dark:fill-rose-900/40" />
      <rect x="10" y="9" width="17" height="22" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <rect x="13.5" y="15" width="10" height="1.5" rx=".75" className="fill-rose-200 dark:fill-rose-300/50" />
      <rect x="13.5" y="18.5" width="10" height="1.5" rx=".75" className="fill-rose-200 dark:fill-rose-300/50" />
      <rect x="13.5" y="22" width="7" height="1.5" rx=".75" className="fill-rose-200 dark:fill-rose-300/50" />
      <circle cx="31.5" cy="30" r="7.5" fill="#F43F5E" />
      <path d="M28.5 27l6 6M34.5 27l-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Image tools (violet palette) ───────────────────────────

export function ImageToPdfIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-violet-100 dark:fill-violet-900/40" />
      <rect x="3" y="12" width="16" height="16" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <path d="M5 26.5l4-5.5 3.5 3.5 2.5-3 3.5 5H5z" fill="#C4B5FD" clipPath="url(#im2pdf-clip)" />
      <clipPath id="im2pdf-clip">
        <rect x="3" y="12" width="16" height="16" rx="2" />
      </clipPath>
      <circle cx="16" cy="14.5" r="1.75" fill="#A78BFA" />
      <path d="M20.5 20h6" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 17.5l2.5 2.5-2.5 2.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="27.5" y="12" width="13" height="18" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <rect x="30" y="18" width="8" height="1.5" rx=".75" className="fill-violet-200 dark:fill-violet-300/50" />
      <rect x="30" y="21" width="8" height="1.5" rx=".75" className="fill-violet-200 dark:fill-violet-300/50" />
      <rect x="30" y="24" width="5" height="1.5" rx=".75" className="fill-violet-200 dark:fill-violet-300/50" />
    </svg>
  );
}

export function ConvertImageIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-violet-100 dark:fill-violet-900/40" />
      <rect x="7" y="10" width="16" height="14" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".88" />
      <path d="M9 22.5l3.5-5 3 3.5 2-2.5 4 4H9z" fill="#C4B5FD" clipPath="url(#conv-clip)" />
      <clipPath id="conv-clip">
        <rect x="7" y="10" width="16" height="14" rx="2" />
      </clipPath>
      <circle cx="19" cy="13" r="1.75" fill="#A78BFA" />
      <path d="M28 13 A8 8 0 1 1 21.5 27" stroke="#7C3AED" strokeWidth="2.25" strokeLinecap="round" fill="none" />
      <path d="M26 10.5l2.5 2.5-3 1.5" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="25" y="28" width="13" height="7" rx="2" className="fill-violet-600 dark:fill-violet-500" />
      <rect x="26.5" y="30.5" width="4" height="1.5" rx=".75" fill="white" />
      <rect x="26.5" y="33" width="3" height="1.5" rx=".75" fill="white" />
      <rect x="32" y="30.5" width="1.5" height="4" rx=".75" fill="white" />
      <rect x="34.5" y="30.5" width="1.5" height="4" rx=".75" fill="white" />
    </svg>
  );
}

// ─── Document tools (emerald palette) ───────────────────────

export function DocsToPdfIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-emerald-100 dark:fill-emerald-900/40" />
      <rect x="7" y="7" width="16" height="20" rx="2" className="fill-emerald-200 dark:fill-emerald-800/60" />
      <rect x="11" y="10" width="16" height="20" rx="2" className="fill-emerald-300 dark:fill-emerald-700/70" />
      <rect x="15" y="13" width="16" height="20" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".95" />
      <rect x="18.5" y="18.5" width="9" height="1.5" rx=".75" className="fill-emerald-200 dark:fill-emerald-300/50" />
      <rect x="18.5" y="22" width="9" height="1.5" rx=".75" className="fill-emerald-200 dark:fill-emerald-300/50" />
      <rect x="18.5" y="25.5" width="5.5" height="1.5" rx=".75" className="fill-emerald-200 dark:fill-emerald-300/50" />
      <rect x="20" y="29.5" width="14" height="7" rx="2" fill="#059669" />
      <path d="M22 31.5v4M22 31.5h2c.8 0 1.5.5 1.5 1.5s-.7 1.5-1.5 1.5H22" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M27 31.5v4M27 31.5h1.5c1 0 2 .9 2 2s-1 2-2 2H27" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M32 31.5v4M32 31.5h2.5M32 33.5h2" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function WordToPdfIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-emerald-100 dark:fill-emerald-900/40" />
      <rect x="3" y="12" width="15" height="18" rx="2" className="fill-blue-700 dark:fill-blue-600" />
      <path d="M6 17l2.5 8 2-4 2 4 2.5-8" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M19.5 21h6" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <path d="M23 18.5l2.5 2.5-2.5 2.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="26.5" y="12" width="14" height="18" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".9" />
      <rect x="29" y="18" width="9" height="1.5" rx=".75" className="fill-emerald-200 dark:fill-emerald-300/50" />
      <rect x="29" y="21.5" width="9" height="1.5" rx=".75" className="fill-emerald-200 dark:fill-emerald-300/50" />
      <rect x="29" y="25" width="5.5" height="1.5" rx=".75" className="fill-emerald-200 dark:fill-emerald-300/50" />
    </svg>
  );
}

export function PowerPointToPdfIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-orange-100 dark:fill-orange-900/40" />
      <rect x="3" y="12" width="15" height="18" rx="2" fill="#EA580C" />
      <path d="M7 17v8M7 17h3.4c1.4 0 2.6 1 2.6 2.5S11.8 22 10.4 22H7" stroke="white" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <circle cx="13.2" cy="17.8" r="2.2" stroke="white" strokeWidth="1.3" fill="none" />
      <path d="M19.5 21h6" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
      <path d="M23 18.5l2.5 2.5-2.5 2.5" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="26.5" y="12" width="14" height="18" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".92" />
      <rect x="29" y="18" width="9" height="1.5" rx=".75" className="fill-orange-200 dark:fill-orange-300/50" />
      <rect x="29" y="21.5" width="9" height="1.5" rx=".75" className="fill-orange-200 dark:fill-orange-300/50" />
      <rect x="29" y="25" width="5.5" height="1.5" rx=".75" className="fill-orange-200 dark:fill-orange-300/50" />
    </svg>
  );
}

export function ScanDocumentIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-teal-100 dark:fill-teal-900/40" />
      <rect x="12" y="10" width="18" height="24" rx="2" className="fill-white dark:fill-slate-200" fillOpacity=".9" />
      <rect x="15.5" y="16.5" width="11" height="1.5" rx=".75" className="fill-teal-200 dark:fill-teal-300/50" />
      <rect x="15.5" y="20" width="11" height="1.5" rx=".75" className="fill-teal-200 dark:fill-teal-300/50" />
      <rect x="15.5" y="23.5" width="7" height="1.5" rx=".75" className="fill-teal-200 dark:fill-teal-300/50" />
      <rect x="12" y="21.5" width="18" height="2" rx="1" fill="#0D9488" fillOpacity=".3" />
      <path d="M6 17v-7h7" stroke="#0D9488" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M38 17v-7h-7" stroke="#0D9488" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M6 27v7h7" stroke="#0D9488" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M38 27v7h-7" stroke="#0D9488" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── Audio tools (amber palette) ────────────────────────────

export function AudioConverterIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-amber-100 dark:fill-amber-900/40" />
      <rect x="5" y="20" width="4.5" height="5" rx="2.25" fill="#FCD34D" />
      <rect x="11.5" y="15" width="4.5" height="15" rx="2.25" fill="#F59E0B" />
      <rect x="18" y="10.5" width="4.5" height="23" rx="2.25" fill="#D97706" />
      <rect x="24.5" y="15.5" width="4.5" height="14" rx="2.25" fill="#F59E0B" />
      <rect x="31" y="20" width="4.5" height="5" rx="2.25" fill="#FCD34D" />
      <path d="M36 35 A6 6 0 0 1 29 30" stroke="#D97706" strokeWidth="1.75" strokeLinecap="round" fill="none" />
      <path d="M34.5 37.5l1.5-2.5-2.5-.5" stroke="#D97706" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── Video tools (sky palette) ──────────────────────────────

export function VideoConverterIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-sky-100 dark:fill-sky-900/40" />
      <rect x="5" y="13" width="22" height="16" rx="2.5" className="fill-white dark:fill-slate-200" fillOpacity=".9" />
      <path d="M27 18l8-4v12l-8-4V18z" fill="#0EA5E9" />
      <path d="M16 17.5l5 4.5-5 4.5V17.5z" fill="#0EA5E9" />
      <path d="M35 34 A5 5 0 0 1 28.5 29.5" stroke="#0284C7" strokeWidth="1.75" strokeLinecap="round" fill="none" />
      <path d="M33.5 36.5l1.5-2.5-2.5-.5" stroke="#0284C7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── Utility tools (slate palette) ──────────────────────────

export function UtilitiesIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect width="44" height="44" rx="11" className="fill-slate-100 dark:fill-slate-700/60" />
      <circle cx="22" cy="21" r="6" stroke="#64748B" strokeWidth="2.25" fill="none" />
      <circle cx="22" cy="21" r="2.25" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="20.5" y="11.5" width="3" height="4" rx="1.5" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="20.5" y="28.5" width="3" height="4" rx="1.5" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="11.5" y="19.5" width="4" height="3" rx="1.5" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="28.5" y="19.5" width="4" height="3" rx="1.5" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="16" y="13.5" width="3" height="4" rx="1.5" className="fill-slate-500 dark:fill-slate-400" transform="rotate(45 17.5 15.5)" />
      <rect x="27" y="26.5" width="3" height="4" rx="1.5" className="fill-slate-500 dark:fill-slate-400" transform="rotate(45 28.5 28.5)" />
      <rect x="26.5" y="13.5" width="3" height="4" rx="1.5" className="fill-slate-500 dark:fill-slate-400" transform="rotate(-45 28 15.5)" />
      <rect x="15.5" y="26.5" width="3" height="4" rx="1.5" className="fill-slate-500 dark:fill-slate-400" transform="rotate(-45 17 28.5)" />
    </svg>
  );
}
