function SelectField({ label, options, value, onChange, helperText }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-900/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white dark:bg-slate-800">
            {option.label}
          </option>
        ))}
      </select>
      {helperText ? <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span> : null}
    </label>
  );
}

export default SelectField;
