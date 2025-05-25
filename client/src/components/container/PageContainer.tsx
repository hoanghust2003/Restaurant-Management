'use client';

import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * PageContainer wraps the content of each page and provides consistent padding and layout.
 * Similar to the ContentWrapper component but specifically for page-level content.
 */
export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
