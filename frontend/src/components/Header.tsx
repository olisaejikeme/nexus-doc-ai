'use client';

import React from 'react';

const Header = () => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
            {/* Light Search Bar */}
            <div className="flex-1 max-w-xl relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Search knowledge base..."
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-900"
                />
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-slate-500">
                    <button className="hover:text-blue-600 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></button>
                    <button className="hover:text-blue-600 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                </div>

                <div className="flex items-center gap-3 border-l border-slate-200 pl-6 text-right">
                    <div className="hidden sm:block">
                        <p className="text-xs font-bold text-slate-900 leading-none">Admin User</p>
                        <p className="text-[10px] text-slate-500 mt-1">admin@nexus.com</p>
                    </div>
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-200">
                        AU
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;