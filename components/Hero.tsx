"use client";

import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
    useEffect(() => {
        const loadScript = () => {
            if (!document.getElementById('unicorn-studio')) {
                const script = document.createElement('script');
                script.id = 'unicorn-studio';
                script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
                script.onload = () => {
                    const win = window as any;
                    if (win.UnicornStudio && !win.UnicornStudio.isInitialized) {
                        win.UnicornStudio.init();
                        win.UnicornStudio.isInitialized = true;
                    }
                };
                document.body.appendChild(script);
            } else {
                const win = window as any;
                if (win.UnicornStudio && !win.UnicornStudio.isInitialized) {
                    win.UnicornStudio.init();
                    win.UnicornStudio.isInitialized = true;
                }
            }
        };
        loadScript();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 50, rotateX: -90 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                duration: 0.6,
                delay: i * 0.03,
                ease: [0.25, 0.1, 0.25, 1]
            }
        })
    };

    const title1 = "Property Investment";
    const title2 = "In South Africa";

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            <div className="absolute inset-0 w-full h-full z-0">
                <div data-us-project="yWZ2Tbe094Fsjgy9NRnD" className="absolute w-full h-full left-0 top-0"></div>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
                <motion.div 
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/20 rounded-full blur-[120px]"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div 
                    className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[120px]"
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </div>

            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.1, zIndex: 0 }}></div>

            <motion.div 
                className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div 
                    variants={itemVariants}
                    className="inline-flex items-center px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-sm"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(16, 185, 129, 0.5)' }}
                >
                    <motion.span 
                        className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    South Africa's Leading Real Estate Investment Firm
                </motion.div>

                <motion.h1 
                    className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight mb-6"
                    variants={itemVariants}
                >
                    <span className="inline-flex flex-wrap justify-center" style={{ perspective: 1000 }}>
                        {title1.split('').map((char, i) => (
                            <motion.span
                                key={i}
                                custom={i}
                                variants={letterVariants}
                                className="inline-block"
                                style={{ transformOrigin: 'bottom' }}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </motion.span>
                        ))}
                    </span>
                    <br />
                    <motion.span 
                        className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto]"
                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    >
                        <span className="inline-flex flex-wrap justify-center" style={{ perspective: 1000 }}>
                            {title2.split('').map((char, i) => (
                                <motion.span
                                    key={i}
                                    custom={i + title1.length}
                                    variants={letterVariants}
                                    className="inline-block"
                                    style={{ transformOrigin: 'bottom' }}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </motion.span>
                            ))}
                        </span>
                    </motion.span>
                </motion.h1>

                <motion.p 
                    className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    variants={itemVariants}
                >
                    Discover high-yield property investing opportunities in South Africa.
                    Secure, pre-vetted real estate investing with turnkey solutions and strong returns.
                </motion.p>

                <motion.div 
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    variants={itemVariants}
                >
                    <motion.button 
                        className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-full overflow-hidden shadow-lg shadow-emerald-500/25"
                        whileHover={{ 
                            scale: 1.05,
                            boxShadow: '0 0 50px rgba(16, 185, 129, 0.4)'
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0"
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        <span className="relative flex items-center text-lg">
                            Start Your Journey 
                            <motion.span
                                className="ml-2"
                                initial={{ x: 0 }}
                                whileHover={{ x: 5 }}
                            >
                                <ArrowRight className="w-5 h-5" />
                            </motion.span>
                        </span>
                    </motion.button>

                    <motion.button 
                        className="px-10 py-5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white font-medium text-lg"
                        whileHover={{ 
                            scale: 1.05,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.3)'
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        View Demo
                    </motion.button>
                </motion.div>
            </motion.div>

            <motion.div 
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
            >
                <motion.div 
                    className="w-7 h-12 rounded-full border-2 border-gray-500/50 flex justify-center pt-2"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <motion.div 
                        className="w-1.5 h-3 bg-emerald-400 rounded-full"
                        animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>
        </section>
    );
}