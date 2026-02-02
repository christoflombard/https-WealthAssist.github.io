'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Invest', href: '/investment-opportunities' },
        { name: 'Services', href: '/services' },
        { name: 'About', href: '/about' },
        { name: 'Testimonials', href: '/testimonials' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold font-heading tracking-tight">
                        Wealth<span className="text-neon-cyan">Assist</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-sm font-medium transition-colors ${pathname === item.href ? 'text-neon-cyan' : 'text-gray-300 hover:text-neon-cyan'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link href="/start">
                            <button className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-neon-cyan/50 hover:bg-neon-cyan/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300 text-white text-sm font-medium">
                                Get Started
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-300 hover:text-white"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col space-y-4">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`text-lg font-medium transition-colors ${pathname === item.href ? 'text-neon-cyan' : 'text-gray-300 hover:text-neon-cyan'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <Link href="/start" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full py-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-bold">
                            Get Started
                        </button>
                    </Link>
                </div>
            )}
        </nav>
    );
}
