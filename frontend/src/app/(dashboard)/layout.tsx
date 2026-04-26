import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}