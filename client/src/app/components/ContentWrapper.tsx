'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { PageTransitionManager, throttle } from '@/app/utils/transitionUtils';

interface LayoutContentProps {
  children: ReactNode;
}

/**
 * ContentWrapper component that prevents entire layout from reloading
 * when navigating between pages with the same layout.
 */
export default function ContentWrapper({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const [content, setContent] = useState<ReactNode>(children);
  const prevPathRef = useRef(pathname);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();
  const rafRef = useRef<number>();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Set up scroll position saving with throttling
  useEffect(() => {
    const handleScroll = throttle(() => {
      if (!PageTransitionManager.isTransitioning()) {
        PageTransitionManager.saveScrollPosition(pathname);
      }
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);
  
  useEffect(() => {
    if (prevPathRef.current === pathname) return;

    // Clean up any existing transitions
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Save current scroll position before navigating away
    PageTransitionManager.saveScrollPosition(prevPathRef.current);
    PageTransitionManager.startTransition();
    
    const contentContainer = contentRef.current;
    if (!contentContainer) {
      setContent(children);
      PageTransitionManager.endTransition();
      prevPathRef.current = pathname;
      return;
    }

    // Prevent pointer events during transition
    contentContainer.style.pointerEvents = 'none';
    contentContainer.style.willChange = 'opacity';
    
    // Start transition out
    contentContainer.style.opacity = '0';
    contentContainer.style.transform = 'translateZ(0)';
    
    transitionTimeoutRef.current = setTimeout(() => {
      // Update content
      setContent(children);
      
      // Schedule transition in after content update
      rafRef.current = requestAnimationFrame(() => {
        contentContainer.style.opacity = '1';
        
        // Cleanup after transition
        transitionTimeoutRef.current = setTimeout(() => {
          contentContainer.style.pointerEvents = 'auto';
          contentContainer.style.willChange = 'auto';
          
          // Handle scroll position restoration
          const isBackNavigation = window.history.state?.navigationType === 'back';
          if (isBackNavigation) {
            requestAnimationFrame(() => {
              PageTransitionManager.restoreScrollPosition(pathname);
            });
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
          
          PageTransitionManager.endTransition();
        }, 300); // Match transition duration
      });
    }, 50); // Small delay for smoother transitions
    
    // Update the previous path
    prevPathRef.current = pathname;
  }, [pathname, children]);
  
  // Clean up all transitions and animations on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={contentRef}
      id="content-wrapper" 
      className="transition-all duration-300 ease-in-out transform-gpu"
      style={{ 
        backfaceVisibility: 'hidden',
      }}
    >
      {content}
    </div>
  );
}
