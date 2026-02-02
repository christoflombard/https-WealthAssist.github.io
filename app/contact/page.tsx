'use client';

import Navbar from "@/components/Navbar";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';

function ContactContent() {
    const searchParams = useSearchParams();
    const interest = searchParams.get('interest');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (interest) {
            console.log('User interested in:', interest);
        }
    }, [interest]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    interest: interest || 'general'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
                alert('Thank you! Your message has been sent successfully.');
            } else {
                setStatus('error');
                alert(data.error || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setStatus('error');
            alert('Failed to send message. Please try again later.');
        } finally {
            if (status !== 'success') {
                setStatus('idle');
            }
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-neon-cyan/30 selection:text-neon-cyan">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow" />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6">
                        Get in <span className="text-gradient">Touch</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Ready to start your wealth creation journey? Contact us today for a consultation.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-3xl font-bold font-heading mb-8">Contact Information</h2>
                            <div className="space-y-8">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-neon-cyan" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-1">Our Office</h3>
                                        <p className="text-gray-400">
                                            Office 16 & 17, The Bridge<br />
                                            304 Durban Road, Bellville, 7530
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-neon-green" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-1">Phone</h3>
                                        <p className="text-gray-400">+27 69 154 6137</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-1">Email</h3>
                                        <p className="text-gray-400">invest@wealthassist.co.za</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="p-8 rounded-2xl glass-panel border border-white/10">
                            <h2 className="text-2xl font-bold font-heading mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan outline-none transition-all text-white placeholder-gray-500"
                                        placeholder="Your Name"
                                        required
                                        disabled={status === 'submitting'}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan outline-none transition-all text-white placeholder-gray-500"
                                        placeholder="your@email.com"
                                        required
                                        disabled={status === 'submitting'}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan outline-none transition-all text-white placeholder-gray-500"
                                        placeholder="How can we help you?"
                                        required
                                        disabled={status === 'submitting'}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className={`w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-green text-slate-950 font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center ${status === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {status === 'submitting' ? 'Sending...' : 'Send Message'} <Send className="ml-2 w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default function Contact() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
            <ContactContent />
        </Suspense>
    );
}
