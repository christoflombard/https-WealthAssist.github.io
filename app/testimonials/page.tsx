import Navbar from "@/components/Navbar";
import { Quote } from "lucide-react";

export default function Testimonials() {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Property Investor",
            content: "Wealth Assist transformed my approach to property investment. Their distressed asset strategy helped me secure a property at 30% below market value.",
            image: "https://i.pravatar.cc/150?u=sarah"
        },
        {
            name: "Michael Chen",
            role: "Business Owner",
            content: "The legal and tax advice I received was invaluable. They helped me structure my portfolio efficiently, saving me significant amounts in the long run.",
            image: "https://i.pravatar.cc/150?u=michael"
        },
        {
            name: "David Smith",
            role: "First-time Investor",
            content: "I was hesitant to start investing, but the team at Wealth Assist guided me through every step. Their due diligence gave me the confidence to proceed.",
            image: "https://i.pravatar.cc/150?u=david"
        },
        {
            name: "Emma Wilson",
            role: "Real Estate Developer",
            content: "A professional and knowledgeable team. Their market insights are spot on, and they always have their clients' best interests at heart.",
            image: "https://i.pravatar.cc/150?u=emma"
        },
        {
            name: "James Brown",
            role: "Retiree",
            content: "Thanks to Wealth Assist, I now have a steady passive income stream from my property investments. I can finally enjoy my retirement with peace of mind.",
            image: "https://i.pravatar.cc/150?u=james"
        },
        {
            name: "Lisa Davis",
            role: "Entrepreneur",
            content: "The impact investing angle really resonated with me. It's great to know that my investments are helping others while also generating good returns.",
            image: "https://i.pravatar.cc/150?u=lisa"
        }
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
                        Client <span className="text-gradient">Stories</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Don't just take our word for it. Hear from the investors who have built their wealth with us.
                    </p>
                </div>
            </section>

            {/* Testimonials Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-2xl glass-panel border border-white/10 hover:bg-white/5 transition-all duration-300"
                            >
                                <Quote className="w-10 h-10 text-neon-cyan/20 mb-6" />
                                <p className="text-gray-300 leading-relaxed mb-6 italic">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 mr-4 overflow-hidden">
                                        {/* Placeholder for user image if needed, or use initials */}
                                        <div className="w-full h-full flex items-center justify-center bg-neon-cyan/20 text-neon-cyan font-bold">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold font-heading text-white">{testimonial.name}</h4>
                                        <p className="text-sm text-neon-cyan">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
