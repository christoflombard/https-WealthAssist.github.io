import Navbar from "@/components/Navbar";
import { Building2, CheckCircle2, Quote, Target, Users } from "lucide-react";

export default function About() {
    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-neon-cyan/30 selection:text-neon-cyan">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-neon-cyan/10 rounded-full blur-[100px] animate-pulse-slow" />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6">
                        About <span className="text-gradient">Wealth Assist</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        We specialize in securing properties at <span className="text-white font-bold">75% or less</span> of their market value, ensuring pre-determined contractual returns for our investors.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="p-8 rounded-2xl glass-panel border border-white/10">
                            <div className="w-12 h-12 bg-neon-cyan/10 rounded-lg flex items-center justify-center mb-6">
                                <Target className="w-6 h-6 text-neon-cyan" />
                            </div>
                            <h2 className="text-2xl font-bold font-heading mb-4">Our Mission</h2>
                            <p className="text-gray-400 leading-relaxed">
                                To disrupt traditional real estate investment models by providing accessible, risk-mitigated opportunities. We aim to assist distressed property owners while offering investors secure, high-yield returns.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl glass-panel border border-white/10">
                            <div className="w-12 h-12 bg-neon-green/10 rounded-lg flex items-center justify-center mb-6">
                                <Building2 className="w-6 h-6 text-neon-green" />
                            </div>
                            <h2 className="text-2xl font-bold font-heading mb-4">Turnkey Solution</h2>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                We deliver a comprehensive turnkey solution covering every aspect of the investment journey:
                            </p>
                            <ul className="space-y-2">
                                {[
                                    "Procurement & Risk Assessment",
                                    "Maintenance & Management",
                                    "Pre & Post-Sales Administration",
                                    "Mortgage Facilitation & Transfer",
                                    "Bond Registration"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center text-sm text-gray-300">
                                        <CheckCircle2 className="w-4 h-4 text-neon-green mr-2" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chairman Quote */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-neon-green/5 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center">
                    <Quote className="w-12 h-12 text-neon-cyan mx-auto mb-6 opacity-50" />
                    <blockquote className="text-2xl md:text-4xl font-heading font-bold leading-tight mb-8">
                        "Our pre-vetted, high-return opportunities redefine the standard in the real estate investment landscape."
                    </blockquote>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="text-left">
                            <div className="text-neon-cyan font-bold text-lg">Daniël Lombard</div>
                            <div className="text-gray-400 text-sm">Executive Chairman</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section Placeholder (kept for structure) */}
            <section className="py-20 relative">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
                            Meet The <span className="text-white">Experts</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Our team combines decades of experience in real estate, law, and finance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Gerhard Van Der Westhuizen */}
                        <div className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-slate-900 border border-white/10 shadow-[0_0_15px_rgba(0,240,255,0.05)] hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-500">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                style={{ backgroundImage: `url('/team/member3.jpg')` }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 z-10"></div>
                            <div className="absolute bottom-0 left-0 w-full p-6 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-xl font-bold font-heading text-white">Gerhard Van Der Westhuizen</h3>
                                <p className="text-neon-cyan text-sm mb-2">CIO</p>
                            </div>
                        </div>

                        {/* Brady Palm */}
                        <div className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-slate-900 border border-white/10 shadow-[0_0_15px_rgba(0,240,255,0.05)] hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-500">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                style={{ backgroundImage: `url('/team/member2.jpg')` }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 z-10"></div>
                            <div className="absolute bottom-0 left-0 w-full p-6 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-xl font-bold font-heading text-white">Brady Palm</h3>
                                <p className="text-neon-cyan text-sm mb-2">Wealth Assist Team</p>
                            </div>
                        </div>

                        {/* Ina Thiart */}
                        <div className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-slate-900 border border-white/10 shadow-[0_0_15px_rgba(0,240,255,0.05)] hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-500">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                style={{ backgroundImage: `url('/team/member1.jpg')` }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 z-10"></div>
                            <div className="absolute bottom-0 left-0 w-full p-6 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-xl font-bold font-heading text-white">Ina Thiart</h3>
                                <p className="text-neon-cyan text-sm mb-2">Wealth Assist Team</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
