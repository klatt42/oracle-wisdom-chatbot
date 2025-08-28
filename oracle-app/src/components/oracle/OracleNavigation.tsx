'use client';

import { useState } from 'react';
import { 
  MessageCircle, 
  Database, 
  Settings, 
  User, 
  LogOut, 
  Sparkles,
  Menu,
  X,
  BookOpen,
  TrendingUp,
  Zap
} from 'lucide-react';

interface NavigationProps {
  activeTab: 'chat' | 'content' | 'settings' | 'profile';
  onTabChange: (tab: 'chat' | 'content' | 'settings' | 'profile') => void;
  onLogout?: () => void;
}

export function OracleNavigation({ activeTab, onTabChange, onLogout }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'chat' as const,
      label: 'Oracle Wisdom',
      icon: MessageCircle,
      description: 'Channel business wisdom through mystical conversation',
      color: 'text-yellow-400'
    },
    {
      id: 'content' as const,
      label: 'Knowledge Forge',
      icon: Database,
      description: 'Feed the Oracle with sacred business texts',
      color: 'text-blue-400'
    },
    {
      id: 'settings' as const,
      label: 'Sacred Config',
      icon: Settings,
      description: 'Configure your Oracle experience',
      color: 'text-purple-400'
    },
    {
      id: 'profile' as const,
      label: 'Mystic Profile',
      icon: User,
      description: 'Manage your Oracle identity and preferences',
      color: 'text-green-400'
    }
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex oracle-card mx-4 mt-4 p-4">
        <div className="flex items-center justify-between w-full">
          {/* Oracle Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-yellow-400 oracle-glow" />
              <div className="absolute inset-0 w-8 h-8 text-yellow-400 oracle-glow animate-ping opacity-20">
                <Sparkles className="w-full h-full" />
              </div>
            </div>
            <div>
              <h1 className="oracle-title text-xl font-bold">ORACLE</h1>
              <p className="oracle-text text-xs opacity-70">Business Wisdom Portal</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-yellow-400/20 to-blue-400/20 border border-yellow-400/30 oracle-glow' 
                      : 'hover:bg-blue-500/10 hover:border-blue-400/20 border border-transparent'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-yellow-400' : item.color} transition-colors`} />
                  <span className={`oracle-text ${isActive ? 'text-yellow-300' : 'text-gray-300'} font-medium`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Stats */}
            <div className="flex items-center gap-4 px-4 py-2 oracle-card bg-gradient-to-r from-blue-900/20 to-purple-900/20">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-sm oracle-text">47 Texts</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm oracle-text">92% Quality</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm oracle-text">2.1k Chunks</span>
              </div>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="oracle-button-secondary px-3 py-2 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Exit Oracle</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="oracle-card mx-4 mt-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400 oracle-glow" />
              <div>
                <h1 className="oracle-title text-lg font-bold">ORACLE</h1>
                <p className="oracle-text text-xs opacity-70">Business Wisdom</p>
              </div>
            </div>
            
            <button
              onClick={toggleMenu}
              className="oracle-button-secondary p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="oracle-card m-4 p-6 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-yellow-400 oracle-glow" />
                  <div>
                    <h2 className="oracle-title text-xl font-bold">ORACLE PORTAL</h2>
                    <p className="oracle-text text-sm opacity-70">Navigate your mystical journey</p>
                  </div>
                </div>
                <button
                  onClick={toggleMenu}
                  className="oracle-button-secondary p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <div className="space-y-3 mb-6">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg text-left transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-yellow-400/20 to-blue-400/20 border border-yellow-400/30 oracle-glow' 
                          : 'hover:bg-blue-500/10 hover:border-blue-400/20 border border-transparent'
                      }`}
                    >
                      <IconComponent className={`w-6 h-6 ${isActive ? 'text-yellow-400' : item.color} transition-colors flex-shrink-0`} />
                      <div className="flex-1">
                        <h3 className={`oracle-text ${isActive ? 'text-yellow-300' : 'text-gray-300'} font-medium mb-1`}>
                          {item.label}
                        </h3>
                        <p className="oracle-text text-xs opacity-60">
                          {item.description}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full oracle-glow flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Stats */}
              <div className="oracle-card p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 mb-6">
                <h3 className="oracle-text font-medium mb-3">Oracle Intelligence</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <BookOpen className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-blue-300">47</div>
                    <div className="text-xs oracle-text opacity-60">Texts</div>
                  </div>
                  <div>
                    <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-green-300">92%</div>
                    <div className="text-xs oracle-text opacity-60">Quality</div>
                  </div>
                  <div>
                    <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-yellow-300">2.1k</div>
                    <div className="text-xs oracle-text opacity-60">Chunks</div>
                  </div>
                </div>
              </div>

              {/* Mobile Logout */}
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="oracle-button w-full py-3 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Exit Oracle Realm
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active Tab Indicator (Desktop) */}
      <div className="hidden md:block mx-4">
        <div className="oracle-card p-3 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
          <div className="flex items-center gap-3">
            {(() => {
              const activeItem = navigationItems.find(item => item.id === activeTab);
              if (!activeItem) return null;
              
              const IconComponent = activeItem.icon;
              return (
                <>
                  <IconComponent className={`w-5 h-5 ${activeItem.color}`} />
                  <div>
                    <h2 className="oracle-text font-medium">{activeItem.label}</h2>
                    <p className="oracle-text text-xs opacity-60">{activeItem.description}</p>
                  </div>
                </>
              );
            })()}
            <div className="flex-1" />
            <div className="text-xs oracle-text opacity-40">
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}