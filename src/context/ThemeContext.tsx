'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // 1. Check local storage
        const savedTheme = localStorage.getItem('theme') as Theme | null;

        if (savedTheme) {
            setThemeState(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else {
            // 2. Check system preference
            const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            setThemeState(systemPreference);
            document.documentElement.classList.toggle('dark', systemPreference === 'dark');
        }
        setMounted(true);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    // We must always provide the context, even if not mounted yet, to avoid runtime errors in consumers.
    // The 'mounted' check is useful for UI that depends on the specific theme value to avoid hydration mismatch,
    // but the Provider itself must exist.

    // To avoid hydration mismatch on the theme value itself, consumers can check a 'mounted' flag if needed,
    // or we accept a small mismatch that useEffect fixes.
    // For now, ensuring the app doesn't crash is the priority.

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
