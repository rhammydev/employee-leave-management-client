import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      {children}
      {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      aria-invalid={error || undefined}
      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
        ${error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-200 bg-gray-50 hover:bg-white focus:bg-white'
        } ${className}`}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  children: ReactNode;
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      aria-invalid={error || undefined}
      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition appearance-none
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
        ${error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-200 bg-gray-50 hover:bg-white focus:bg-white'
        } ${className}`}
    >
      {children}
    </select>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      aria-invalid={error || undefined}
      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none resize-none transition
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
        ${error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-200 bg-gray-50 hover:bg-white focus:bg-white'
        } ${className}`}
    />
  );
}
