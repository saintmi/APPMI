// ============================================================================
// Field — label + control + bantuan + galat (Fase 8 §4.8)
// ============================================================================

import type { ReactNode } from 'react';

export interface FieldProps {
  label?: string;
  help?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Field({ label, help, error, required, className, children }: FieldProps) {
  return (
    <div className={`field ${className ?? ''}`}>
      {label && (
        <label className="field__label">{label} {required ? <span style={{ color: 'var(--color-danger)' }}>*</span> : null}</label>
      )}
      {children}
      {help && <p className="field__help">{help}</p>}
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
