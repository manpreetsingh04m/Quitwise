import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={twMerge(
        "bg-white rounded-2xl shadow-sm border border-gray-100 p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
