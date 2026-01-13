// Initialize theme before app renders to avoid FOUC
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let shouldBeDark: boolean;
  
  if (savedTheme === 'system') {
    // Follow OS preference
    shouldBeDark = prefersDark;
  } else if (savedTheme === 'light') {
    shouldBeDark = false;
  } else {
    // Default to dark mode (savedTheme === 'dark' or null)
    shouldBeDark = true;
  }
  
  if (shouldBeDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
