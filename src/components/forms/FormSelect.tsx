import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  options: Option[];
  required?: boolean;
}

export function FormSelect({ label, name, options, required }: FormSelectProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}