// themeColors.js
// Centralized color palette and class helpers for theme-based UI

export const themeColors = {
  light: {
    background: 'bg-white',
    backgroundSecondary: 'bg-neutral-100',
    panel: 'bg-white',
    card: 'bg-neutral-50 border-neutral-200',
    border: 'border-neutral-200',
    text: 'text-neutral-900',
    textSecondary: 'text-neutral-500',
    label: 'text-neutral-700',
    cardTitle: 'text-neutral-900',
    cardDesc: 'text-neutral-600',
    input: 'bg-white text-neutral-900 border-neutral-300 focus:ring-cyan-500',
    button: 'bg-cyan-600 text-white hover:bg-cyan-700',
    buttonSecondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300',
    buttonDanger: 'bg-red-600 text-white hover:bg-red-700',
    accent: 'bg-cyan-600',
    accentText: 'text-white',
    accentHover: 'hover:bg-cyan-700',
    icon: 'text-cyan-600',
    effect: 'ring-cyan-500',
    focusRing: 'focus:ring-cyan-500',
    dangerText: 'text-red-600',
  },
  dark: {
    background: 'bg-[#0a0e17]', // deep blue-black
    backgroundSecondary: 'bg-[#131a26]', // panel dark blue
    panel: 'bg-[#131a26]',
    card: 'bg-[#161c23] border-[#22304a]',
    border: 'border-[#22304a]',
    text: 'text-slate-100',
    textSecondary: 'text-slate-400',
    label: 'text-slate-300',
    cardTitle: 'text-slate-100',
    cardDesc: 'text-slate-400',
    input: 'bg-[#131a26] text-cyan-100 border-[#22304a] focus:ring-cyan-400',
    button: 'bg-cyan-700 text-cyan-50 hover:bg-cyan-600',
    buttonSecondary: 'bg-[#22304a] text-cyan-200 hover:bg-[#1a2537]',
    buttonDanger: 'bg-red-700 text-white hover:bg-red-600',
    accent: 'bg-cyan-600',
    accentText: 'text-cyan-50',
    accentHover: 'hover:bg-cyan-500',
    icon: 'text-cyan-400',
    effect: 'ring-cyan-400',
    focusRing: 'focus:ring-cyan-400',
    dangerText: 'text-red-400',
  },
  system: {}, // handled in getThemeColor
};

// Helper to get color class by theme and key
export function getThemeColor(theme, key) {
  if (theme === 'system' || theme === 'auto') {
    // Use light by default, but allow dark override with 'dark:'
    // Example: 'bg-white dark:bg-neutral-900'
    const light = themeColors.light[key] || '';
    const dark = themeColors.dark[key] || '';
    if (light && dark && light !== dark) {
      // Only merge if different
      // Merge each class, add dark: prefix for dark
      const lightClasses = light.split(' ');
      const darkClasses = dark.split(' ');
      // Only add dark: if not already present
      const merged = [
        ...lightClasses,
        ...darkClasses.map(cls => cls.startsWith('dark:') ? cls : `dark:${cls}`)
      ];
      return merged.join(' ');
    }
    return light || dark || '';
  }
  if (themeColors[theme] && themeColors[theme][key]) return themeColors[theme][key];
  // fallback: try light, then dark
  return themeColors.light[key] || themeColors.dark[key] || '';
}
