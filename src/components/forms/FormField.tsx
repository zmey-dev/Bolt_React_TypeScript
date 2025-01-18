import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}

export function FormField({ label, name, type, required }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        required={required}
        className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
      />
    </div>
  );
}