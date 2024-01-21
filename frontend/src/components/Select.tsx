export default function Select({
  label,
  tooltip,
  options,
  value,
  onChange,
}: {
  label: string;
  tooltip?: string;
  options: {
    label: string;
    value: string;
  }[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="label">
        <span className="label-text">{label}</span>
        {tooltip && (
          <div className="tooltip tooltip-left" data-tip={tooltip}>
            <i className="fa-regular fa-circle-question label-text-alt text-lg"></i>
          </div>
        )}
      </div>
      <select
        className="select select-primary w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
