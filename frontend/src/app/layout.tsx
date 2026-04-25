import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-slate-50 text-slate-900">
        {/* The Sidebar stays fixed on the left */}
        <Sidebar />

        {/* The Right side contains the Header and the Page Content */}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
