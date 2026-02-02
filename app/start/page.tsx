'use client';

import Navbar from "@/components/Navbar";
import { ArrowRight, Building2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Start() {
    const [selectedPath, setSelectedPath] = useState<null | 'investor' | 'owner'>(null);

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-neon-cyan/30 selection:text-neon-cyan">
            <Navbar />

            <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none"></div>

                {/* Animated Background Orbs */}
                <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-neon-cyan/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] bg-neon-green/10 rounded-full blur-[100px] animate-pulse-slow delay-700" />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
                            Choose Your <span className="text-gradient">Path</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            How can Wealth Assist help you achieve your financial goals today?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Investor Path */}
                        <button
                            onClick={() => setSelectedPath('investor')}
                            className={`group relative p-8 rounded-2xl glass-panel border transition-all duration-300 text-left ${selectedPath === 'investor'
                                ? 'border-neon-cyan bg-neon-cyan/5 shadow-[0_0_30px_rgba(0,240,255,0.1)]'
                                : 'border-white/10 hover:border-neon-cyan/50 hover:bg-white/5'
                                }`}
                        >
                            <div className="mb-6 p-4 rounded-full bg-neon-cyan/10 w-fit">
                                <TrendingUp className="w-8 h-8 text-neon-cyan" />
                            </div>
                            <h2 className="text-2xl font-bold font-heading mb-3 text-white">I want to Invest</h2>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                I am looking for high-yield, secured property investment opportunities to grow my wealth.
                            </p>
                            <div className={`flex items-center text-neon-cyan font-bold transition-transform duration-300 ${selectedPath === 'investor' ? 'translate-x-2' : 'group-hover:translate-x-2'}`}>
                                Start Investing <ArrowRight className="ml-2 w-5 h-5" />
                            </div>
                        </button>

                        {/* Property Owner Path */}
                        <button
                            onClick={() => setSelectedPath('owner')}
                            className={`group relative p-8 rounded-2xl glass-panel border transition-all duration-300 text-left ${selectedPath === 'owner'
                                ? 'border-neon-green bg-neon-green/5 shadow-[0_0_30px_rgba(0,255,136,0.1)]'
                                : 'border-white/10 hover:border-neon-green/50 hover:bg-white/5'
                                }`}
                        >
                            <div className="mb-6 p-4 rounded-full bg-neon-green/10 w-fit">
                                <Building2 className="w-8 h-8 text-neon-green" />
                            </div>
                            <h2 className="text-2xl font-bold font-heading mb-3 text-white">I need Assistance</h2>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                I am a property owner facing financial challenges and need a solution to protect my asset.
                            </p>
                            <div className={`flex items-center text-neon-green font-bold transition-transform duration-300 ${selectedPath === 'owner' ? 'translate-x-2' : 'group-hover:translate-x-2'}`}>
                                Get Assistance <ArrowRight className="ml-2 w-5 h-5" />
                            </div>
                        </button>
                    </div>

                    {/* Next Step Action */}
                    {selectedPath && (
                        <div className="mt-12 text-center animate-float">
                            <Link href={`/contact?interest=${selectedPath}`}>
                                <button className={`px-12 py-5 rounded-full font-bold text-lg shadow-lg transition-all hover:scale-105 ${selectedPath === 'investor'
                                    ? 'bg-neon-cyan text-slate-950 shadow-neon-cyan/20'
                                    : 'bg-neon-green text-slate-950 shadow-neon-green/20'
                                    }`}>
                                    Continue as {selectedPath === 'investor' ? 'Investor' : 'Property Owner'}
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
