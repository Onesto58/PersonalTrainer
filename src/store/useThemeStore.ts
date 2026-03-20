import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'system',
            setTheme: (theme) => {
                set({ theme });
                updateDOMTheme(theme);
            },
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    updateDOMTheme(state.theme);
                }
            },
        }
    )
);

// Helper to update the DOM
const updateDOMTheme = (theme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        root.classList.add(systemTheme);
    } else {
        root.classList.add(theme);
    }
};

// Listener for system preference changes
if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const currentState = useThemeStore.getState();
        if (currentState.theme === 'system') {
            updateDOMTheme('system');
        }
    });
}
