import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-semibold text-stone-700 mb-1.5 ml-1">{label}</label>}
    <input
      className={`
        w-full p-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl 
        focus:border-orange-500 focus:bg-white focus:outline-none 
        transition-all duration-200 placeholder:text-stone-400
        ${error ? 'border-red-500' : ''}
        ${className}
      `}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
  </div>
);
