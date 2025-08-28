'use client';

import { useState } from 'react';
import { OracleLogin } from '@/components/OracleLogin';
import { EnhancedOracleChat } from '@/components/EnhancedOracleChat';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <OracleLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return <EnhancedOracleChat />;
}
