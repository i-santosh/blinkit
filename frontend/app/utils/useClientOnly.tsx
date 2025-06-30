import React, { useState, useEffect } from 'react';

export function useClientOnly() {
  return function ClientOnly({ 
    children, 
    fallback = null 
  }: { 
    children: React.ReactNode, 
    fallback?: React.ReactNode 
  }) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
      setHasMounted(true);
    }, []);

    if (!hasMounted) {
      return fallback;
    }

    return <>{children}</>;
  };
} 