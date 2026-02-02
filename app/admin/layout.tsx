import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-neutral-100 font-sans">
            <aside className="w-64 bg-white shadow-xl z-10 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-gold-500 to-amber-600 bg-clip-text text-transparent">
                        WealthAssist<span className="text-gray-400 font-light">Admin</span>
                    </h1>
                </div>
                <nav className="mt-6 flex-1 px-4 space-y-2">
                    <Link href="/admin" className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gold-50 hover:text-gold-600 transition-colors">
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/admin/create" className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gold-50 hover:text-gold-600 transition-colors">
                        <span className="font-medium">+ New Opportunity</span>
                    </Link>
                    <div className="pt-8 border-t border-gray-100 mt-8">
                        <Link href="/" className="flex items-center px-4 py-3 text-gray-400 rounded-lg hover:bg-gray-50 hover:text-gray-600 transition-colors">
                            <span className="text-sm">← Back to Site</span>
                        </Link>
                    </div>
                </nav>
                <div className="p-4 text-xs text-gray-300 text-center">
                    v1.0.0
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
