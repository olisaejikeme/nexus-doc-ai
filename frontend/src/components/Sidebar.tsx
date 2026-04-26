'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const Sidebar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Close sidebar on route change on mobile
        if (isMobile) {
            setIsMobileOpen(false);
        }
    }, [pathname, isMobile]);

    const handleLogout = () => {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        router.push('/login');
    };

    const sidebarContent = (
        <aside className={`w-64 bg-slate-900 h-screen text-white flex flex-col border-r border-slate-800 transition-transform duration-300 ${isMobile ? (isMobileOpen ? 'fixed left-0 top-0 z-50 shadow-2xl' : 'fixed left-0 top-0 -translate-x-full') : 'relative'
            }`}>
            <div className="p-6 flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-500">NexusDoc</span>
                {isMobile && (
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="text-slate-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <Link
                    href="/"
                    className={`block px-4 py-2 rounded transition ${pathname === '/' ? 'bg-slate-800 text-blue-500' : 'hover:bg-slate-800'}`}
                >
                    Document Library
                </Link>
                <Link
                    href="/chat"
                    className={`block px-4 py-2 rounded transition ${pathname === '/chat' ? 'bg-slate-800 text-blue-500' : 'hover:bg-slate-800'}`}
                >
                    Chat
                </Link>
            </nav>

            <div className="p-4 mt-auto">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                            Storage Usage
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-[62%]" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">12.4 GB of 20 GB used</p>
                </div>
            </div>

            <div className="p-4 border-t border-slate-800 space-y-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-red-900/20 rounded transition group"
                >
                    <svg className="w-4 h-4 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
                <div className="px-4 text-xs text-slate-500 font-mono uppercase tracking-tighter">
                    v1.0.0-beta
                </div>
            </div>
        </aside>
    );

    return (
        <>
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
            {sidebarContent}
            {isMobile && !isMobileOpen && (
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="fixed bottom-4 left-4 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg md:hidden"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            )}
        </>
    );
};

export default Sidebar;