/**
 * Responsive Layout Hook
 *
 * Tracks window dimensions and provides breakpoint flags.
 * Mobile: < 768px, Tablet: 768-1024px, Desktop: > 1024px
 */

import { useEffect, useRef, useState } from 'react';

export interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** Combined mobile + tablet */
  isTouchDevice: boolean;
}

export function useResponsive(): ResponsiveState {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleResize = () => {
      // Throttle to one update per animation frame
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width >= 768 && dimensions.width <= 1024;
  const isDesktop = dimensions.width > 1024;

  return {
    width: dimensions.width,
    height: dimensions.height,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: isMobile || isTablet,
  };
}
