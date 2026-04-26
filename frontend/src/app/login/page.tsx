'use client';

import toast from 'react-hot-toast';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import LockIcon from '@/components/LockIcon';
import ThemeToggle from '@/components/ThemeToggle';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const loginToast = toast.loading('Authenticating...');

        try {
            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api/v1';
            console.log("Base URL: " + baseUrl)

            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const res = await response.json();

            if (res.status) {
                const token = res.data.access_token;
                document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
                toast.success(res.message || 'Welcome back!', { id: loginToast });
                router.push('/');
            } else {
                toast.error(res.message || 'Invalid credentials.', { id: loginToast });
            }
        } catch (error) {
            toast.error('Authentication service unreachable.', { id: loginToast });
        }
    };

    return (
        <div className="min-h-screen flex text-[13px] relative">
            {/* Theme Toggle - Positioned absolutely in the top right */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* LEFT SIDE - Dark background always stays dark */}
            <div className="hidden lg:flex flex-1 bg-[#030712] p-16 flex-col justify-between relative overflow-hidden">
                <BrandLogo />

                <div className="max-w-xl space-y-6 relative z-10">
                    <span className="inline-block bg-blue-500/10 px-3 py-1 rounded text-[11px] font-bold text-blue-500 uppercase tracking-widest">
                        Enterprise Intelligence
                    </span>

                    <h1 className="text-5xl font-bold text-white leading-tight">
                        Your Company's Knowledge, Instantly Accessible
                    </h1>

                    <p className="text-slate-400 text-base leading-relaxed">
                        Leverage RAG-powered document intelligence to transform fragmented data into precise, actionable enterprise operations.
                    </p>
                </div>

                <div className="flex gap-12 border-t border-slate-800/60 pt-8 relative z-10">
                    <div>
                        <div className="text-white text-2xl font-bold">99.9%</div>
                        <div className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                            Extraction Accuracy
                        </div>
                    </div>

                    <div>
                        <div className="text-white text-2xl font-bold">RAG-Native</div>
                        <div className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                            Architecture
                        </div>
                    </div>

                    <div>
                        <div className="text-white text-2xl font-bold">SOC2</div>
                        <div className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                            Compliance
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
            </div>

            {/* RIGHT SIDE - This will toggle between light/dark mode */}
            <div className="w-full lg:w-[550px] p-12 lg:p-24 flex flex-col justify-between bg-white dark:bg-slate-950 transition-colors duration-300">
                <div className="my-auto space-y-10">
                    {/* Header */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Welcome back
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Enter your credentials to access your dashboard.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-900 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white bg-white dark:bg-slate-900 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none mt-2"
                        >
                            Sign In
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>

                        <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-slate-950 px-4 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                                Enterprise Access
                            </span>
                        </div>
                    </div>

                    {/* SSO Button */}
                    <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 py-3 rounded-lg font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 cursor-not-allowed opacity-80"
                    >
                        <LockIcon /> Sign in with SSO
                    </button>
                </div>

                {/* Footer */}
                <div className="flex justify-between text-slate-500 dark:text-slate-500 text-[11px] font-medium border-t border-slate-200 dark:border-slate-800 pt-8 mt-8">
                    <div className="space-x-4">
                        <Link href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                            Privacy
                        </Link>
                        <Link href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                            Terms
                        </Link>
                    </div>
                    <span>© 2026 NexusDoc AI</span>
                </div>
            </div>
        </div>
    );
}