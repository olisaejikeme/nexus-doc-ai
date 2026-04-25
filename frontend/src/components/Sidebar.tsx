import React from 'react';

const Sidebar = () => {
    return (
        <aside className="w-64 bg-slate-900 h-screen text-white flex flex-col border-r border-slate-800">
            <div className="p-6 text-2xl font-bold text-blue-500">
                NexusDoc
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <a href="#" className="block px-4 py-2 rounded bg-blue-600 text-white">
                    Document Library
                </a>
                <a href="#" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
                    Chat
                </a>
                <a href="#" className="block px-4 py-2 rounded hover:bg-slate-800 transition">
                    Settings
                </a>
            </nav>

            <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
                v1.0.0-beta
            </div>
        </aside>
    );
};

export default Sidebar;