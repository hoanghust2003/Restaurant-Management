import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg border shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }: CardHeaderProps) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = "" }: CardTitleProps) => {
  return <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>;
};

export const CardDescription = ({ children, className = "" }: CardDescriptionProps) => {
  return <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>;
};

export const CardContent = ({ children, className = "" }: CardContentProps) => {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = "" }: CardFooterProps) => {
  return <div className={`p-6 pt-0 border-t ${className}`}>{children}</div>;
};