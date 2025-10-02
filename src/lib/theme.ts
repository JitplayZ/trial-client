// Initialize theme before app renders to avoid FOUC
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Default to dark mode unless user explicitly saved light mode
  const shouldBeDark = savedTheme === 'dark' || (!savedTheme && (prefersDark || true));
  
  if (shouldBeDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
