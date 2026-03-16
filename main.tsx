import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl shadow-sm border border-stone-100 p-5 ${onClick ? 'cursor-pointer active:scale-98 transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);
