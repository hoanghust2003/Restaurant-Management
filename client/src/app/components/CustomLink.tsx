'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CustomLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  passHref?: boolean;
  target?: string;
  rel?: string;
}

/**
 * CustomLink component that enhances Next.js Link with better SPA-like transitions
 */
export default function CustomLink({ 
  href, 
  children, 
  className = '', 
  onClick,
  title,
  passHref,
  target,
  rel
}: CustomLinkProps) {
  const router = useRouter();
    const handleClick = (e: React.MouseEvent) => {
    // Don't intercept if target="_blank" is specified
    if (target === '_blank') {
      return;
    }
    
    // If there's a custom onClick handler, call it first
    if (onClick) {
      onClick(e);
      // If preventDefault was called in the onClick handler, or href is "#",
      // don't proceed with navigation
      if (e.defaultPrevented || href === '#') {
        return;
      }
    }
    
    // Prevent default browser navigation for regular links
    e.preventDefault();
    
    // Navigate without full page reload using Next.js router
    router.push(href);
  };
    return (
    <Link 
      href={href} 
      onClick={handleClick} 
      className={className}
      title={title}
      target={target}
      rel={rel}
      {...(passHref ? { passHref: true } : {})}
    >
      {children}
    </Link>
  );
}
