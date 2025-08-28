'use client';

import { useState, useEffect } from 'react';
import { OracleNavigation } from './OracleNavigation';
import { EnhancedOracleChat } from '../EnhancedOracleChat';
import { OracleContentManager } from './OracleContentManager';
import { OracleSettings } from './OracleSettings';
import { OracleProfile } from './OracleProfile';

type ActiveTab = 'chat' | 'content' | 'settings' | 'profile';

interface OracleAppProps {
  onLogout?: () => void;
  initialTab?: ActiveTab;
}

export function OracleApp({ onLogout, initialTab = 'chat' }: OracleAppProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [isLoading, setIsLoading] = useState(false);

  // Handle tab change with loading state
  const handleTabChange = (tab: ActiveTab) => {
    if (tab === activeTab) return;
    
    setIsLoading(true);
    setActiveTab(tab);
    
    // Simulate loading for smooth transitions
    setTimeout(() => setIsLoading(false), 300);
  };

  // Handle logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Get the current tab component
  const renderActiveTab = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="oracle-card p-8 text-center">
            <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="oracle-text opacity-70">Channeling mystical energies...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'chat':
        return <EnhancedOracleChat />;
      case 'content':
        return <OracleContentManager />;
      case 'settings':
        return <OracleSettings />;
      case 'profile':
        return <OracleProfile />;
      default:
        return <EnhancedOracleChat />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <OracleNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="transition-all duration-300">
        {renderActiveTab()}
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Mystical Background Patterns */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}

// Placeholder components for Settings and Profile
function OracleSettings() {
  return (
    <div className="p-6">
      <div className="oracle-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-400/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">⚙️</span>
        </div>
        <h2 className="oracle-title text-2xl mb-4">Sacred Configuration</h2>
        <p className="oracle-text opacity-70 mb-6">
          Configure your Oracle experience and mystical preferences.
        </p>
        <div className="oracle-card p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <p className="oracle-text text-sm opacity-60">
            Settings interface coming soon in the next mystical update...
          </p>
        </div>
      </div>
    </div>
  );
}

function OracleProfile() {
  return (
    <div className="p-6">
      <div className="oracle-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-400/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
        <h2 className="oracle-title text-2xl mb-4">Mystic Profile</h2>
        <p className="oracle-text opacity-70 mb-6">
          Manage your Oracle identity and business professional preferences.
        </p>
        <div className="oracle-card p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20">
          <p className="oracle-text text-sm opacity-60">
            Profile management interface manifesting in the next release...
          </p>
        </div>
      </div>
    </div>
  );
}