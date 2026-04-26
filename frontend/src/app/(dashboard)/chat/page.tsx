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

    const getAuthToken = () =>
        document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    const fetchHistory = useCallback(async () => {
        const token = getAuthToken();
        try {
            const response = await fetch(`${API_BASE}/chats/sessions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res = await response.json();
            if (res.status) setSessions(res.data);
        } catch (e) {
            console.error('History fetch failed', e);
        }
    }, [API_BASE]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const loadSession = async (sessionId: number) => {
        const token = getAuthToken();
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/chats/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const res = await response.json();
            if (res.status && res.data) {
                setMessages(res.data.messages || []);
                setCurrentSessionId(sessionId);
            }
        } catch {
            toast.error('Could not load chat.');
        } finally {
            setIsLoading(false);
        }
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
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: userMessage, session_id: currentSessionId }),
            });

            const res = await response.json();

            if (res.status) {
                if (!currentSessionId) {
                    setCurrentSessionId(res.data.session_id);
                    fetchHistory();
                }

                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: res.data.answer,
                        sources: res.data.sources,
                    },
                ]);
            }
        } catch {
            toast.error('Error sending message.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full p-6">
            <div className="flex gap-6 h-full max-w-[1400px] mx-auto">

                {/* SIDEBAR */}
                <div className="w-80 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">

                    {/* New Chat */}
                    <button
                        onClick={() => {
                            setMessages([]);
                            setCurrentSessionId(null);
                        }}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Chat
                    </button>

                    {/* Divider */}
                    <div className="my-4 border-t border-slate-200 dark:border-slate-700"></div>

                    {/* Recent Chats */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1 mb-2">
                            Recent Chats
                        </h3>

                        {sessions.length === 0 ? (
                            <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-6">
                                No chats yet
                            </div>
                        ) : (
                            sessions.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => loadSession(s.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-all ${currentSessionId === s.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {s.title}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* MAIN CHAT */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">

                    {/* EMPTY STATE */}
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                Welcome to NexusAI
                            </h3>

                            <p className="text-slate-500 dark:text-slate-400 max-w-md">
                                Ask questions about your documents and I'll help you find answers from your knowledge base.
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${msg.role === 'user'
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        : 'bg-blue-600 text-white'
                                        }`}>
                                        {msg.role === 'user' ? 'U' : 'AI'}
                                    </div>

                                    <div className={`max-w-[80%] p-4 rounded-2xl border ${msg.role === 'user'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                                            {msg.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>
                    )}

                    {/* INPUT */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your knowledge base..."
                            className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                        />

                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                        >
                            →
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}