type Theme = 'light' | 'dark';

export const themeClasses = {
  // Backgrounds
  bg: (theme: Theme) => theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50',
  bgCard: (theme: Theme) => theme === 'dark' ? 'bg-slate-800' : 'bg-white',
  bgCardAlt: (theme: Theme) => theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50',
  bgInput: (theme: Theme) => theme === 'dark' ? 'bg-slate-900' : 'bg-white',
  
  // Borders
  border: (theme: Theme) => theme === 'dark' ? 'border-slate-700' : 'border-gray-200',
  borderInput: (theme: Theme) => theme === 'dark' ? 'border-slate-600' : 'border-gray-300',
  borderHover: (theme: Theme) => theme === 'dark' ? 'hover:border-amber-500' : 'hover:border-amber-600',
  
  // Text
  text: (theme: Theme) => theme === 'dark' ? 'text-white' : 'text-gray-900',
  textMuted: (theme: Theme) => theme === 'dark' ? 'text-slate-400' : 'text-gray-600',
  textSubtle: (theme: Theme) => theme === 'dark' ? 'text-slate-500' : 'text-gray-500',
  textLabel: (theme: Theme) => theme === 'dark' ? 'text-slate-300' : 'text-gray-700',
  
  // Accent
  accent: (theme: Theme) => theme === 'dark' ? 'text-amber-500' : 'text-amber-600',
  bgAccent: (theme: Theme) => theme === 'dark' ? 'bg-amber-500' : 'bg-amber-600',
  hoverAccent: (theme: Theme) => theme === 'dark' ? 'hover:bg-amber-600' : 'hover:bg-amber-700',
  
  // Buttons
  btnPrimary: (theme: Theme) => theme === 'dark' 
    ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' 
    : 'bg-amber-600 hover:bg-amber-700 text-white',
  btnOutline: (theme: Theme) => theme === 'dark'
    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
    : 'border-gray-300 text-gray-700 hover:bg-gray-100',
  btnGhost: (theme: Theme) => theme === 'dark'
    ? 'text-slate-300 hover:text-white hover:bg-slate-700'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  
  // Icons in badge
  iconInBadge: (theme: Theme) => theme === 'dark' ? 'text-slate-900' : 'text-white',
  
  // Placeholder
  placeholder: (theme: Theme) => theme === 'dark' ? 'placeholder:text-slate-500' : 'placeholder:text-gray-400',
};
