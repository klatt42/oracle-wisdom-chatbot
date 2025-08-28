'use client';

import { useState } from 'react';
import { OracleLogin } from '@/components/OracleLogin';
import { OracleApp } from '@/components/oracle/OracleApp';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <OracleLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <OracleApp 
      onLogout={() => setIsAuthenticated(false)}
      initialTab="chat"
    />
  );
}
