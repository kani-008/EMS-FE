// src/components/DynamicForm.jsx
// Single reusable modal form shell driven by a field-config array.
// Field state stays with the caller (controlled `values`/`onChange`) so
// cross-field derivation (batch validation, auto-computed prefixes, etc.)
// can live in the caller as plain callbacks instead of being copy-pasted
// JSX in every "Create ___" screen.
import Button from "./Button";
import Dropdown from "./Dropdown";

// ── One field, dispatched by `type` ──────────────────────────────────────────
function Field({ field, values, onChange, errors }) {
  if (field.hidden?.(values)) return null;
  if (field.render) return field.render(values, onChange);

  const value = values[field.name] ?? "";
  const disabled = typeof field.disabled === "function" ? field.disabled(values) : !!field.disabled;
  const error = errors?.[field.name];
  const colSpanClass = field.colSpan === 2 ? "col-span-2" : "";

  const set = (v) => onChange(field.name, v);

  let control;
  switch (field.type) {
    case "select":
      control = (
        <Dropdown
          value={value}
          onChange={set}
          options={typeof field.options === "function" ? field.options(values) : field.options || []}
          placeholder={field.placeholder || "Select…"}
          disabled={disabled}
        />
      );
      break;

    case "static":
      control = (
        <div className="form-input-static w-full">
          <span className={value ? "" : "text-slate-400"}>
            {(typeof field.value === "function" ? field.value(values) : value) || "—"}
          </span>
          {field.staticBadge && (
            <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {field.staticBadge}
            </span>
          )}
        </div>
      );
      break;

    case "textarea":
      control = (
        <textarea
          value={value}
          onChange={(e) => set(e.target.value)}
          rows={field.rows || 3}
          placeholder={field.placeholder}
          disabled={disabled}
          className="form-input w-full resize-none"
        />
      );
      break;

    default:
      control = (
        <input
          type={field.type || "text"}
          value={value}
          readOnly={field.readOnly}
          disabled={disabled}
          onChange={(e) => set(e.target.value)}
          onBlur={field.onBlur ? () => field.onBlur(values) : undefined}
          placeholder={field.placeholder}
          className={field.readOnly ? "form-input-static w-full" : "form-input w-full"}
        />
      );
  }

  return (
    <div className={colSpanClass}>
      <label className="form-label">{field.label}</label>
      {control}
      {field.helpText && !error && (
        <p className="text-xs text-slate-400 mt-1">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const DynamicForm = ({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel = "Create",
  submitting = false,
  submitDisabled = false,
  errors,
  formError,
  onClose,
  width = "w-[700px]",
  extraContent,
  secondaryAction, // { label, onClick, disabled }
  subtitle,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`${width} max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg p-6`}>
        <h2 className="text-sm font-semibold text-blue-800 mb-1">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}

        <div className={`grid grid-cols-2 gap-4 text-sm ${subtitle ? "" : "mt-4"}`}>
          {fields.map((field, idx) => (
            <Field key={`${field.name}-${idx}`} field={field} values={values} onChange={onChange} errors={errors} />
          ))}

          {extraContent}

          {formError && (
            <div className="col-span-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              ⚠ {formError}
            </div>
          )}

          <div className="col-span-2 flex justify-end gap-3 mt-4">
            {secondaryAction && (
              <Button
                label={secondaryAction.label}
                variant="outline-blue"
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled}
              />
            )}
            <Button
              label={submitting ? "Saving…" : submitLabel}
              variant="primary"
              onClick={onSubmit}
              disabled={submitting || submitDisabled}
            />
            <Button label="Cancel" variant="danger" onClick={onClose} disabled={submitting} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicForm;
