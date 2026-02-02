import Navbar from "@/components/Navbar";
import { ArrowRight, BarChart3, Gavel, HandCoins, Landmark, Scale } from "lucide-react";

export default function Services() {
    const services = [
        {
            icon: <BarChart3 className="w-8 h-8 text-neon-cyan" />,
            title: "Property Investment Advice",
            description: "Comprehensive guidance on building a profitable property portfolio. We analyze market trends and identify high-growth opportunities tailored to your financial goals.",
        },
        {
            icon: <Gavel className="w-8 h-8 text-neon-green" />,
            title: "Legal Services",
            description: "Expert legal support for all property transactions. Our team ensures compliance and protects your interests in every deal, from contracts to transfers.",
        },
        {
            icon: <HandCoins className="w-8 h-8 text-purple-400" />,
            title: "Tax Planning",
            description: "Strategic tax advice to maximize your investment returns. We help you navigate property tax laws and structure your investments for optimal efficiency.",
        },
        {
            icon: <Landmark className="w-8 h-8 text-pink-400" />,
            title: "Distressed Asset Recovery",
            description: "Specialized solutions for distressed properties. We help owners avoid repossession while providing investors with secured, high-yield opportunities.",
        },
        {
            icon: <Scale className="w-8 h-8 text-yellow-400" />,
            title: "Due Diligence",
            description: "Rigorous vetting of every investment opportunity. We conduct thorough background checks and financial analysis to mitigate risk.",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-neon-cyan/30 selection:text-neon-cyan">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-neon-green/10 rounded-full blur-[100px] animate-pulse-slow" />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6">
                        Our <span className="text-gradient">Services</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        End-to-end solutions for the modern property investor. From acquisition to management, we cover every aspect of your wealth creation journey.
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="group p-8 rounded-2xl glass-panel border border-white/10 hover:bg-white/5 transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className="mb-6 p-4 rounded-full bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4 font-heading">{service.title}</h3>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    {service.description}
                                </p>
                                <button className="flex items-center text-neon-cyan font-medium group-hover:translate-x-2 transition-transform">
                                    Learn More <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-neon-green/10 backdrop-blur-3xl"></div>
                <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">
                        Ready to Grow Your Wealth?
                    </h2>
                    <p className="text-gray-300 mb-8 text-lg">
                        Join hundreds of successful investors who trust Wealth Assist with their property portfolios.
                    </p>
                    <button className="px-8 py-4 bg-white text-slate-950 font-bold rounded-full hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all">
                        Get Started Today
                    </button>
                </div>
            </section>
        </main>
    );
}
