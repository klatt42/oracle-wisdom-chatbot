/**
 * Oracle Settings Component
 */

import React from 'react';

export function OracleSettings() {
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