import { createSlice } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.transition = 'background-color 0.5s ease, color 0.5s ease';
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  setTimeout(() => {
    root.style.transition = '';
  }, 500);
}

const saved = localStorage.getItem('theme') as Theme | null;
const initialTheme: Theme = saved === 'dark' ? 'dark' : 'light';
applyTheme(initialTheme);

const themeSlice = createSlice({
  name: 'theme',
  initialState: { theme: initialTheme } as ThemeState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
      applyTheme(state.theme);
    },
    setTheme(state, action: { payload: Theme }) {
      state.theme = action.payload;
      localStorage.setItem('theme', state.theme);
      applyTheme(state.theme);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
