import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200",
    secondary: "bg-stone-100 hover:bg-stone-200 text-stone-800",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white",
    info: "bg-sky-500 hover:bg-sky-600 text-white",
    ghost: "bg-transparent hover:bg-stone-100 text-stone-600"
  };

  return (
    <button
      className={`
        py-3 px-4 rounded-2xl font-bold transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
        active:scale-95 flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : ''} 
        ${variants[variant]} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
