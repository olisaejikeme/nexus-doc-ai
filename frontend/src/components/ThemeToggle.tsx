// components/ThemeToggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle({ className = "" }: { className?: string }) {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    if (!mounted) {
        return <div className="w-8 h-8"></div>;
    }

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 ${className}`}
            aria-label="Toggle theme"
        >
            {isDark ? (
                <SunIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-500" />
            ) : (
                <MoonIcon className="w-5 h-5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" />
            )}
        </button>
    );
}