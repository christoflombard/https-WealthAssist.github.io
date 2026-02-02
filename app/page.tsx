'use client'

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { ArrowRight, CheckCircle2, Shield, TrendingUp, Users, Wallet, Sparkles } from "lucide-react";
import Link from "next/link";
import { 
  ScrollReveal, 
  StaggerContainer, 
  StaggerItem,
  SplitText, 
  CountUp, 
  GradientText,
  TiltCard,
  MagneticButton,
  FloatingElement
} from "@/components/animations";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-neon-cyan/30 selection:text-neon-cyan overflow-x-hidden">
            <Navbar />
            <Hero />

            {/* Track Record Strip */}
            <section className="py-16 bg-white border-y border-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent"></div>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center" staggerDelay={0.15}>
                        <StaggerItem>
                            <div className="group">
                                <CountUp
                                    end={300}
                                    prefix="R"
                                    suffix="m+"
                                    className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500 block mb-1"
                                />
                                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold group-hover:text-emerald-600 transition-colors">Historical Returns</div>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="group">
                                <CountUp
                                    end={12}
                                    suffix=" Years"
                                    className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-green-600 block mb-1"
                                />
                                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold group-hover:text-green-600 transition-colors">Track Record</div>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="group">
                                <CountUp
                                    end={20.94}
                                    suffix="%"
                                    decimals={2}
                                    className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500 block mb-1"
                                />
                                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold group-hover:text-cyan-600 transition-colors">Avg Return (Buy & Lease)</div>
                            </div>
                        </StaggerItem>
                        <StaggerItem>
                            <div className="group">
                                <CountUp
                                    end={31.44}
                                    suffix="%"
                                    decimals={2}
                                    className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-600 block mb-1"
                                />
                                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold group-hover:text-emerald-600 transition-colors">Avg Return (Flips)</div>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </section>

            {/* Value Proposition Section */}
            <section className="py-28 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl"></div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="text-center mb-20">
                        <motion.div 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-400">Why Choose Us</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-6xl font-bold font-heading mb-6">
                            <SplitText text="Why Choose" className="text-white" type="words" />
                            <br />
                            <GradientText text="Wealth Assist?" from="#10b981" via="#06b6d4" to="#3b82f6" />
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            We offer a unique approach to real estate investment, designed to generate both financial prosperity and positive social impact.
                        </p>
                    </ScrollReveal>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16" staggerDelay={0.2}>
                        {[
                            { value: '75%', label: 'Max Purchase Price', desc: 'We secure properties at 75% or less of their market value, ensuring instant equity.', color: 'cyan' },
                            { value: '2 Years', label: 'Average Term', desc: 'Efficient investment timelines typically ranging from 6 months to 3 years.', color: 'green' },
                            { value: 'Fully Managed', label: 'Solution', desc: 'From procurement to transfer, management, and exit—we handle it all.', color: 'purple' },
                        ].map((item, i) => (
                            <StaggerItem key={i}>
                                <TiltCard className="h-full">
                                    <motion.div 
                                        className={`p-8 rounded-2xl glass-panel border border-white/10 text-center h-full hover:border-neon-${item.color}/30 transition-all duration-500`}
                                        whileHover={{ 
                                            boxShadow: item.color === 'cyan' 
                                                ? '0 0 40px rgba(0, 240, 255, 0.15)' 
                                                : item.color === 'green'
                                                    ? '0 0 40px rgba(0, 255, 136, 0.15)'
                                                    : '0 0 40px rgba(168, 85, 247, 0.15)'
                                        }}
                                    >
                                        <motion.div 
                                            className={`text-4xl font-bold mb-2 ${
                                                item.color === 'cyan' ? 'text-neon-cyan' : 
                                                item.color === 'green' ? 'text-neon-green' : 'text-purple-400'
                                            }`}
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                        >
                                            {item.value}
                                        </motion.div>
                                        <div className="text-sm text-gray-400 uppercase tracking-wider font-bold">{item.label}</div>
                                        <p className="mt-4 text-gray-300">{item.desc}</p>
                                    </motion.div>
                                </TiltCard>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* Investment Products Overview */}
            <section className="py-28 bg-gradient-to-b from-slate-900/50 to-slate-950 relative">
                <div className="absolute inset-0 overflow-hidden">
                    <FloatingElement className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" duration={8} distance={30}>
                        <div />
                    </FloatingElement>
                    <FloatingElement className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" duration={10} distance={40} delay={2}>
                        <div />
                    </FloatingElement>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <ScrollReveal className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold font-heading mb-6">
                            <span className="text-white">Our </span>
                            <GradientText text="Investment Products" from="#10b981" via="#22c55e" to="#06b6d4" />
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            Choose from our curated selection of high-yield, secured real estate opportunities.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { 
                                title: 'Buy & Lease Back', 
                                return: '20.94%', 
                                returnLabel: 'Avg Return',
                                desc: 'Acquire property at below market value and lease it back to the owner.',
                                features: ['Capital Growth & Rental Income', '16.59% - 27.81% Historical Range'],
                                icon: TrendingUp,
                                gradient: 'from-neon-cyan/50 to-neon-cyan/10',
                                color: 'neon-cyan'
                            },
                            { 
                                title: 'Property Flips', 
                                return: '31.44%', 
                                returnLabel: 'Avg Return',
                                desc: 'Strategic short-term investments with pre-determined exit strategies.',
                                features: ['17% - 35%+ Historical Returns', 'Pre-determined Contractual Returns'],
                                icon: Wallet,
                                gradient: 'from-neon-green/50 to-neon-green/10',
                                color: 'neon-green'
                            },
                            { 
                                title: 'RE-Start', 
                                return: 'Buy-to-Hold', 
                                returnLabel: 'Model',
                                desc: 'Locks in fixed returns from day one. Tenant responsible for maintenance.',
                                features: ['4.75% Capital Growth p.a.', 'Prime + 3% Net Rental'],
                                icon: Shield,
                                gradient: 'from-purple-500/50 to-purple-500/10',
                                color: 'purple-400'
                            },
                        ].map((product, i) => (
                            <ScrollReveal key={i} delay={i * 0.15} direction="up">
                                <motion.div 
                                    className={`group relative p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:${product.gradient} transition-all duration-500`}
                                    whileHover={{ y: -8 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <div className="bg-slate-950 rounded-xl p-8 h-full relative overflow-hidden">
                                        <motion.div 
                                            className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-all duration-500"
                                            whileHover={{ rotate: 15, scale: 1.1 }}
                                        >
                                            <product.icon className="w-24 h-24 text-white" />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold font-heading mb-2">{product.title}</h3>
                                        <div className={`text-${product.color} font-bold text-lg mb-1`}>{product.return}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-4">{product.returnLabel}</div>
                                        <p className="text-gray-400 mb-6 text-sm">{product.desc}</p>
                                        <ul className="space-y-2 mb-8 text-sm text-gray-300">
                                            {product.features.map((feat, j) => (
                                                <motion.li 
                                                    key={j} 
                                                    className="flex items-center"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + j * 0.1 }}
                                                >
                                                    <CheckCircle2 className={`w-4 h-4 text-${product.color} mr-2`} />
                                                    {feat}
                                                </motion.li>
                                            ))}
                                        </ul>
                                        <MagneticButton>
                                            <Link 
                                                href="/investment-opportunities" 
                                                className={`inline-flex items-center text-${product.color} hover:text-white font-bold transition-colors group/link`}
                                            >
                                                View Details 
                                                <motion.span
                                                    className="inline-block ml-2"
                                                    initial={{ x: 0 }}
                                                    whileHover={{ x: 5 }}
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </motion.span>
                                            </Link>
                                        </MagneticButton>
                                    </div>
                                </motion.div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Investing */}
            <section className="py-28 relative overflow-hidden">
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5"
                    animate={{ 
                        background: [
                            'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 50%, rgba(6,182,212,0.05) 100%)',
                            'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, transparent 50%, rgba(16,185,129,0.05) 100%)',
                            'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 50%, rgba(6,182,212,0.05) 100%)',
                        ]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
                
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <ScrollReveal direction="left">
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight">
                                    <SplitText text="Impact Investing with" type="words" />
                                    <br />
                                    <GradientText text="Heart & Returns" from="#10b981" via="#06b6d4" to="#8b5cf6" />
                                </h2>
                                <p className="text-gray-400 mb-6 leading-relaxed text-lg">
                                    Our core mission goes beyond financial returns. We assist distressed homeowners to recover and retain their properties, or unlock equity to start afresh.
                                </p>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    By investing with Wealth Assist, you are not just securing high yields; you are making a meaningful social impact, stabilizing families and communities.
                                </p>
                                <StaggerContainer className="flex flex-col sm:flex-row gap-4" staggerDelay={0.1}>
                                    {['Win-Win Model', 'Social Impact'].map((label, i) => (
                                        <StaggerItem key={i}>
                                            <motion.div 
                                                className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                                                whileHover={{ scale: 1.05, borderColor: 'rgba(16, 185, 129, 0.3)' }}
                                            >
                                                <div className="text-2xl font-bold text-white mb-1">{label.split(' ')[0]}</div>
                                                <div className="text-sm text-gray-400">{label.split(' ').slice(1).join(' ') || 'Positive Change'}</div>
                                            </motion.div>
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            </motion.div>
                        </ScrollReveal>
                        
                        <ScrollReveal direction="right" delay={0.2}>
                            <div className="relative">
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-3xl opacity-20"
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        opacity: [0.2, 0.3, 0.2]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                />
                                <TiltCard maxTilt={10}>
                                    <div className="relative rounded-2xl overflow-hidden border border-white/10 glass-panel p-8 backdrop-blur-xl">
                                        <FloatingElement duration={4} distance={5}>
                                            <Users className="w-16 h-16 text-emerald-400 mb-6" />
                                        </FloatingElement>
                                        <blockquote className="text-xl font-medium text-white mb-6 leading-relaxed">
                                            "Wealth Assist's commitment to both financial outcomes and positive social impact really sets them apart."
                                        </blockquote>
                                        <div className="text-sm text-gray-400">- Satisfied Investor</div>
                                    </div>
                                </TiltCard>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-28 bg-gradient-to-b from-slate-900 to-slate-950 text-center relative overflow-hidden">
                <div className="absolute inset-0">
                    <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-emerald-500/10 via-transparent to-transparent rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 6, repeat: Infinity }}
                    />
                </div>
                
                <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
                    <ScrollReveal>
                        <h2 className="text-4xl md:text-6xl font-bold font-heading mb-6">
                            <SplitText text="Ready to Start Your" type="words" />
                            <br />
                            <GradientText text="Journey?" from="#10b981" via="#22c55e" to="#06b6d4" />
                        </h2>
                        <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto">
                            Discover which investment product suits your goals. Take our quick quiz or watch our introductory webinar to get started.
                        </p>
                    </ScrollReveal>
                    
                    <ScrollReveal delay={0.3}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <MagneticButton strength={0.2}>
                                <Link href="/start">
                                    <motion.button 
                                        className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-full text-lg shadow-lg shadow-emerald-500/25"
                                        whileHover={{ 
                                            scale: 1.05,
                                            boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)'
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Take the Investment Quiz
                                    </motion.button>
                                </Link>
                            </MagneticButton>
                            <MagneticButton strength={0.2}>
                                <motion.button 
                                    className="px-10 py-5 bg-white/5 border border-white/20 text-white font-bold rounded-full text-lg backdrop-blur-sm"
                                    whileHover={{ 
                                        scale: 1.05,
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        borderColor: 'rgba(255,255,255,0.3)'
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Watch Intro Webinar
                                </motion.button>
                            </MagneticButton>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 border-t border-white/5 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <motion.div 
                            className="text-3xl font-bold font-heading tracking-tight mb-4 md:mb-0"
                            whileHover={{ scale: 1.05 }}
                        >
                            Wealth<span className="text-emerald-400">Assist</span>
                        </motion.div>
                        <div className="text-gray-500 text-sm">
                            © 2024 Wealth Assist. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}