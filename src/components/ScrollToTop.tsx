import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component - automatically scrolls to top on route change
 * Place this component inside Router to ensure page starts at top when navigating
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

