import React, { useEffect, useRef, useState } from 'react';

const FIELD_CONTROL_CLASS =
  'w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed';

interface BaseFieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  hideLabel?: boolean;
}

export interface AdminInputFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  min?: number;
  max?: number;
  step?: number | 'any';
  autoFocus?: boolean;
  inputClassName?: string;
  readOnly?: boolean;
}

export const AdminInputField: React.FC<AdminInputFieldProps> = ({
  label,
  hint,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  max,
  step,
  disabled,
  autoFocus,
  inputClassName,
  readOnly,
  containerClassName,
  labelClassName,
  hideLabel,
}) => {
  return (
    <div className={containerClassName}>
      {!hideLabel ? (
        <label className={labelClassName || 'block text-white/55 text-xs mb-1.5'}>
          {label}
          {required ? <span className="text-orange-300 ml-1">*</span> : null}
        </label>
      ) : null}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        autoFocus={autoFocus}
        readOnly={readOnly}
        className={[FIELD_CONTROL_CLASS, inputClassName].filter(Boolean).join(' ')}
      />
      {hint ? <p className="text-white/35 text-[11px] mt-1">{hint}</p> : null}
    </div>
  );
};

export interface AdminTextareaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  textareaClassName?: string;
  readOnly?: boolean;
}

export const AdminTextareaField: React.FC<AdminTextareaFieldProps> = ({
  label,
  hint,
  required,
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled,
  textareaClassName,
  readOnly,
  containerClassName,
  labelClassName,
  hideLabel,
}) => {
  return (
    <div className={containerClassName}>
      {!hideLabel ? (
        <label className={labelClassName || 'block text-white/55 text-xs mb-1.5'}>
          {label}
          {required ? <span className="text-orange-300 ml-1">*</span> : null}
        </label>
      ) : null}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        className={[FIELD_CONTROL_CLASS, textareaClassName].filter(Boolean).join(' ')}
      />
      {hint ? <p className="text-white/35 text-[11px] mt-1">{hint}</p> : null}
    </div>
  );
};

export interface AdminSelectOption {
  value: string;
  label: string;
}

export interface AdminSelectFieldProps extends BaseFieldProps {
  value: string;
  options: AdminSelectOption[];
  onChange: (value: string) => void;
  selectClassName?: string;
  placeholder?: string;
}

export const AdminSelectField: React.FC<AdminSelectFieldProps> = ({
  label,
  hint,
  required,
  value,
  options,
  onChange,
  disabled,
  selectClassName,
  placeholder,
  containerClassName,
  labelClassName,
  hideLabel,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div className={['relative', containerClassName].filter(Boolean).join(' ')} ref={containerRef}>
      {!hideLabel ? (
        <label className={labelClassName || 'block text-white/55 text-xs mb-1.5'}>
          {label}
          {required ? <span className="text-orange-300 ml-1">*</span> : null}
        </label>
      ) : null}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        className={[
          FIELD_CONTROL_CLASS,
          'text-left flex items-center justify-between',
          selectClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span>{selected?.label ?? placeholder ?? 'Tanlang'}</span>
        <svg
          className={`w-4 h-4 text-white/45 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && !disabled ? (
        <ul
          role="listbox"
          className="absolute z-30 mt-2 w-full max-h-60 overflow-y-auto rounded-xl bg-[#101010] border border-white/10 shadow-[0_16px_30px_rgba(0,0,0,0.45)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-orange-500/15 text-orange-300'
                    : 'text-white/75 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      ) : null}

      {hint ? <p className="text-white/35 text-[11px] mt-1">{hint}</p> : null}
    </div>
  );
};
