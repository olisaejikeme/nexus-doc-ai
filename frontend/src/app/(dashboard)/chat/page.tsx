'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

type Source = { name: string; page?: number; excerpt?: string };
type Message = { role: 'user' | 'assistant'; content: string; sources?: Source[] };
type SessionItem = { id: number; title: string; created_at: string };

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api/v1';

    const getAuthToken = () => document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    // 1. Fetch Chat History (Sessions) for the sidebar
    const fetchHistory = useCallback(async () => {
        const token = getAuthToken();
        try {
            const response = await fetch(`${API_BASE}/chats/sessions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.status) setSessions(res.data);
        } catch (e) { console.error("History fetch failed", e); }
    }, [API_BASE]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    // 2. Load messages for a specific session
    const loadSession = async (sessionId: number) => {
        const token = getAuthToken();
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/chats/sessions/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.status && res.data) {
                // Make sure the messages are being extracted correctly
                const sessionMessages = res.data.messages || [];
                setMessages(sessionMessages);
                setCurrentSessionId(sessionId);
            } else {
                toast.error(res.message || "Could not load chat.");
            }
        } catch (e) {
            console.error("Error loading session:", e);
            toast.error("Could not load chat.");
        }
        finally { setIsLoading(false); }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        const token = getAuthToken();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/chats`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userMessage, session_id: currentSessionId })
            });

            const res = await response.json();
            if (res.status) {
                if (!currentSessionId) {
                    setCurrentSessionId(res.data.session_id);
                    fetchHistory(); // Refresh sidebar to show new session title
                }
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: res.data.answer,
                    sources: res.data.sources
                }]);
            }
        } catch (error) { toast.error("Error sending message."); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6">
            {/* SIDEBAR: SESSION HISTORY */}
            <div className="w-80 flex flex-col gap-4">
                <button
                    onClick={() => { setMessages([]); setCurrentSessionId(null); }}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    New Chat
                </button>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Recent Chats</h3>
                    {sessions.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => loadSession(s.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all text-sm truncate ${currentSessionId === s.id
                                ? 'bg-white border-blue-500 text-blue-600 shadow-sm'
                                : 'bg-transparent border-transparent text-slate-600 hover:bg-white hover:border-slate-200'
                                }`}
                        >
                            {s.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.role === 'user' ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white'}`}>
                                {msg.role === 'user' ? 'U' : 'AI'}
                            </div>
                            <div className={`max-w-[80%] p-4 rounded-2xl border ${msg.role === 'user' ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                                        {msg.sources.map((src, j) => (
                                            <span key={j} className="text-[10px] bg-slate-50 text-blue-600 px-2 py-1 rounded border border-blue-50">
                                                {src.name} {src.page ? `(p. ${src.page})` : ''}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>

                {/* INPUT AREA */}
                <form onSubmit={handleSendMessage} className="p-6 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your knowledge base..."
                        className="flex-1 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                    <button disabled={isLoading} className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
}