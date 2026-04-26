'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Sidebar = () => {
    const router = useRouter();

    const handleLogout = () => {
        // 1. Clear the cookie by setting expiry to the past
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        // 2. Force a hard redirect to the login page
        router.push('/login');
    };

    return (
        <aside className="w-64 bg-slate-900 h-screen text-white flex flex-col border-r border-slate-800">
            <div className="p-6 text-2xl font-bold text-blue-500">
                NexusDoc
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <Link href="/" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
                    Document Library
                </Link>
                <Link href="/chat" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
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

            {/* Logout Section */}
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
};

export default Sidebar;