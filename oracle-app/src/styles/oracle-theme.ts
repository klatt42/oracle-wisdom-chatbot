/**
 * Oracle Mystical Theme System
 * Dr. Sarah Hook + Elena Execution - Phase 3.5 Oracle Content Management
 */

export const oracleTheme = {
  // Mystical Color Palette
  colors: {
    // Primary Oracle Colors
    mysticalPurple: '#6366F1',
    deepViolet: '#4C1D95',
    cosmicBlue: '#1E40AF',
    etherealGold: '#F59E0B',
    
    // Sacred Gradients
    primaryGradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
    goldGradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)',
    cosmicGradient: 'linear-gradient(135deg, #1E3A8A 0%, #3730A3 50%, #4C1D95 100%)',
    
    // Neutral Mystical Tones
    obsidianBlack: '#0F0F23',
    midnightGray: '#1F2937',
    stardustGray: '#374151',
    moonbeamSilver: '#9CA3AF',
    crystallineWhite: '#F9FAFB',
    
    // Accent Colors
    emeraldWisdom: '#10B981',
    crimsonWarning: '#EF4444',
    amberAlert: '#F59E0B',
    sapphireInfo: '#3B82F6',
    
    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    processing: '#8B5CF6'
  },

  // Sacred Typography
  typography: {
    // Display Fonts (Mystical Headers)
    displayFont: '"Cinzel", "Times New Roman", serif',
    
    // Body Fonts (Professional Content)
    bodyFont: '"Inter", "Segoe UI", sans-serif',
    
    // Monospace (Code/Technical)
    monoFont: '"JetBrains Mono", "Consolas", monospace',
    
    // Font Sizes
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem'   // 60px
    },
    
    // Font Weights
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    }
  },

  // Mystical Spacing (Based on Golden Ratio)
  spacing: {
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    32: '8rem',       // 128px
    40: '10rem',      // 160px
    48: '12rem',      // 192px
    56: '14rem',      // 224px
    64: '16rem'       // 256px
  },

  // Sacred Shadows (Dimensional Depth)
  shadows: {
    mystical: '0 4px 20px rgba(99, 102, 241, 0.15), 0 0 40px rgba(139, 92, 246, 0.1)',
    ethereal: '0 8px 32px rgba(99, 102, 241, 0.2), 0 0 60px rgba(168, 85, 247, 0.15)',
    cosmic: '0 12px 48px rgba(30, 58, 138, 0.25), 0 0 80px rgba(76, 29, 149, 0.2)',
    golden: '0 4px 20px rgba(245, 158, 11, 0.15), 0 0 40px rgba(251, 191, 36, 0.1)',
    
    // Standard Shadows
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
  },

  // Sacred Borders
  borders: {
    mystical: '1px solid rgba(99, 102, 241, 0.3)',
    ethereal: '2px solid rgba(139, 92, 246, 0.4)',
    golden: '1px solid rgba(245, 158, 11, 0.3)',
    subtle: '1px solid rgba(156, 163, 175, 0.2)',
    
    radius: {
      none: '0',
      sm: '0.125rem',   // 2px
      base: '0.25rem',  // 4px
      md: '0.375rem',   // 6px
      lg: '0.5rem',     // 8px
      xl: '0.75rem',    // 12px
      '2xl': '1rem',    // 16px
      '3xl': '1.5rem',  // 24px
      full: '9999px'
    }
  },

  // Animation Timings (Sacred Rhythms)
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    slower: '500ms ease-in-out',
    
    // Mystical Easings
    mystical: 'cubic-bezier(0.4, 0, 0.2, 1)',
    ethereal: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    cosmic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },

  // Component Variants
  variants: {
    card: {
      mystical: {
        background: 'rgba(15, 15, 35, 0.8)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)'
      },
      ethereal: {
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        boxShadow: '0 12px 48px rgba(139, 92, 246, 0.2)'
      },
      golden: {
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(251, 191, 36, 0.05) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.1)'
      }
    },

    button: {
      primary: {
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
      },
      secondary: {
        background: 'transparent',
        color: '#6366F1',
        border: '1px solid rgba(99, 102, 241, 0.5)',
        boxShadow: 'none'
      },
      golden: {
        background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        color: '#0F0F23',
        border: 'none',
        boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
      }
    }
  },

  // Breakpoints for Responsive Design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// CSS-in-JS Helper Functions
export const getOracleGradient = (type: keyof typeof oracleTheme.colors) => {
  const gradients = {
    primaryGradient: oracleTheme.colors.primaryGradient,
    goldGradient: oracleTheme.colors.goldGradient,
    cosmicGradient: oracleTheme.colors.cosmicGradient
  };
  return gradients[type] || oracleTheme.colors.primaryGradient;
};

export const getMysticalShadow = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
  const shadows = {
    light: oracleTheme.shadows.mystical,
    medium: oracleTheme.shadows.ethereal,
    heavy: oracleTheme.shadows.cosmic
  };
  return shadows[intensity];
};

export const getResponsiveSpacing = (size: keyof typeof oracleTheme.spacing) => {
  return {
    padding: oracleTheme.spacing[size],
    margin: oracleTheme.spacing[size]
  };
};

// Animation Keyframes
export const mysticalAnimations = {
  fadeInUp: `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  pulseGlow: `
    @keyframes pulseGlow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
      }
      50% {
        box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
      }
    }
  `,
  
  shimmer: `
    @keyframes shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }
  `,
  
  float: `
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `
};

export default oracleTheme;