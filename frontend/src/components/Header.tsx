import React from 'react';

const Header = () => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
            <div className="text-slate-500 font-medium">
                Workspace / <span className="text-slate-900">General</span>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">user@company.com</span>
                <div className="w-8 h-8 bg-slate-200 rounded-full border border-slate-300"></div>
            </div>
        </header>
    );
};

export default Header;