// A row of chips for choosing one value or several. Used for type, regions, levels, filters.
interface Props<K extends string> {
  legend: string;
  options: Record<K, string> | [K, string][];
  value: K | K[] | null;
  onChange: (value: K) => void;
  hint?: string;
}

export default function Choices<K extends string>({ legend, options, value, onChange, hint }: Props<K>) {
  const entries = Array.isArray(options) ? options : (Object.entries(options) as [K, string][]);
  const picked = (k: K) => (Array.isArray(value) ? value.includes(k) : value === k);
  return (
    <fieldset className="field">
      <legend className="field__label">{legend}</legend>
      <div className="chips">
        {entries.map(([k, label]) => (
          <button key={k} type="button" className="chip" aria-pressed={picked(k)} onClick={() => onChange(k)}>
            {label}
          </button>
        ))}
      </div>
      {hint && <span className="field__hint">{hint}</span>}
    </fieldset>
  );
}
