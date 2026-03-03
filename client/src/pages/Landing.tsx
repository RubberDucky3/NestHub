import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#FBF8F3] text-[#3D2B1F] font-['DM_Sans',_sans-serif] selection:bg-[#C8714A] selection:text-white">
            {/* Navbar */}
            <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8714A] to-[#A3462A] flex items-center justify-center shadow-lg">
                        <svg viewBox="0 0 72 72" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M36 14L13 34h7v20h12V38h8v16h12V34h7L36 14z" fill="white" opacity="0.95" />
                            <circle cx="36" cy="38" r="4.5" fill="#C8714A" />
                        </svg>
                    </div>
                    <div className="flex flex-col leading-[1]">
                        <span className="font-['Fraunces',_serif] text-xl font-bold tracking-tight text-[#3D2B1F]">Home</span>
                        <span className="font-['Fraunces',_serif] text-xl font-normal italic tracking-tight text-[#C8714A] -mt-1">Hub</span>
                    </div>
                </div>

                <nav className="flex items-center gap-4">
                    {user ? (
                        <Link href="/dashboard">
                            <Button className="bg-[#C8714A] hover:bg-[#A3462A] text-white rounded-full px-6 font-medium shadow-sm transition-all">
                                Go to Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/auth">
                                <Button variant="ghost" className="text-[#8C7B6B] hover:text-[#3D2B1F] hover:bg-[#F0D5C4] rounded-full font-medium">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/auth">
                                <Button className="bg-[#C8714A] hover:bg-[#A3462A] text-white rounded-full px-6 font-medium shadow-sm transition-all hidden sm:inline-flex">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <section className="relative px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_80%_60%_at_20%_80%,rgba(200,113,74,0.1)_0%,transparent_60%),radial-gradient(ellipse_60%_50%_at_80%_20%,rgba(122,158,126,0.08)_0%,transparent_55%)]"></div>

                <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
                    <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-[#8C7B6B] mb-8 bg-[#F0D5C4]/30 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm border border-[#F0D5C4]/50">
                        For modern households
                    </div>

                    <h1 className="font-['Fraunces',_serif] text-5xl md:text-7xl font-bold text-[#3D2B1F] mb-8 leading-[1.1] tracking-tight">
                        Your home,<br />
                        <span className="italic text-[#C8714A]">beautifully</span> managed.
                    </h1>

                    <p className="text-xl md:text-2xl text-[#8C7B6B] font-light max-w-2xl mx-auto mb-12 leading-relaxed">
                        HomeHub keeps your household running smoothly — from weekly chores to monthly budgets, every task and reminder lives in one warm, organised space your whole family can share.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Link href={user ? "/dashboard" : "/auth"}>
                            <Button className="w-full sm:w-auto h-14 bg-[#3D2B1F] hover:bg-[#523A2A] text-[#F5EFE6] rounded-full px-8 text-lg font-medium shadow-lg hover:-translate-y-0.5 transition-all">
                                {user ? "Open Workspace" : "Start your free trial"}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Value Pillars */}
            <section className="bg-white py-24 border-y border-[#F0D5C4]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <div>
                            <div className="text-4xl text-[#C8714A] font-['Fraunces',_serif] font-bold mb-4 border-b border-[#F0D5C4] pb-4 inline-block">01</div>
                            <h3 className="font-['Fraunces',_serif] text-xl font-semibold text-[#3D2B1F] mb-3">Warm, not clinical</h3>
                            <p className="text-[#8C7B6B] font-light leading-relaxed">HomeHub feels like your kitchen, not a spreadsheet. Every surface, every tone should feel lived-in and inviting.</p>
                        </div>
                        <div>
                            <div className="text-4xl text-[#7A9E7E] font-['Fraunces',_serif] font-bold mb-4 border-b border-[#F0D5C4] pb-4 inline-block">02</div>
                            <h3 className="font-['Fraunces',_serif] text-xl font-semibold text-[#3D2B1F] mb-3">Clear, not complicated</h3>
                            <p className="text-[#8C7B6B] font-light leading-relaxed">Busy families don't have time to figure things out. Everything is obvious at a glance. Reduce, clarify, simplify.</p>
                        </div>
                        <div>
                            <div className="text-4xl text-[#E8C98A] font-['Fraunces',_serif] font-bold mb-4 border-b border-[#F0D5C4] pb-4 inline-block">03</div>
                            <h3 className="font-['Fraunces',_serif] text-xl font-semibold text-[#3D2B1F] mb-3">Together, not solo</h3>
                            <p className="text-[#8C7B6B] font-light leading-relaxed">Home management is a team sport. The brand celebrates shared effort and collective ownership over individual tasks.</p>
                        </div>
                        <div>
                            <div className="text-4xl text-[#A3462A] font-['Fraunces',_serif] font-bold mb-4 border-b border-[#F0D5C4] pb-4 inline-block">04</div>
                            <h3 className="font-['Fraunces',_serif] text-xl font-semibold text-[#3D2B1F] mb-3">Calm, not frantic</h3>
                            <p className="text-[#8C7B6B] font-light leading-relaxed">Even when there's a lot to do, HomeHub brings order and peace of mind with a visual language that never feels overwhelming.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interface Showcase / Features */}
            <section className="py-24 max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="text-[10px] font-medium tracking-[0.24em] uppercase text-[#C8714A] mb-4">Inside the Hub</div>
                    <h2 className="font-['Fraunces',_serif] text-4xl mb-6 font-semibold text-[#3D2B1F]">Everything in its place</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto mb-20 bg-white p-6 rounded-[24px] border border-[#F0D5C4] shadow-[0_2px_12px_rgba(61,43,31,0.04)]">
                    <div className="p-8">
                        <h3 className="font-['Fraunces',_serif] text-2xl font-semibold text-[#3D2B1F] mb-4">Task Management</h3>
                        <p className="text-[#8C7B6B] font-light leading-relaxed text-lg">
                            Assign chores to family members with recurrent scheduling. It's the end of nagging, and the beginning of accountability.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 p-4">
                        <div className="bg-white rounded-xl p-5 border border-[#F0D5C4] flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#F0D5C4]/30 flex items-center justify-center shrink-0">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="#C8714A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#C8714A" strokeWidth="2" strokeLinecap="round" /></svg>
                            </div>
                            <div className="flex-1">
                                <div className="font-['Fraunces',_serif] text-lg font-semibold text-[#3D2B1F]">Deep clean bathroom</div>
                                <div className="text-sm text-[#8C7B6B] font-light">Assigned to Maya · Every 2 weeks</div>
                            </div>
                            <div className="text-xs font-medium px-3 py-1 bg-[#E8F5E9] text-[#4F7152] rounded-full">Done</div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto bg-white p-6 rounded-[24px] border border-[#F0D5C4] shadow-[0_2px_12px_rgba(61,43,31,0.04)]">
                    <div className="order-2 md:order-1 flex flex-col gap-4 p-4">
                        <div className="bg-white rounded-xl p-5 border border-[#F0D5C4] flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] flex items-center justify-center shrink-0">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#E8C98A" strokeWidth="2" /><path d="M16 2v4M8 2v4M3 10h18" stroke="#E8C98A" strokeWidth="2" strokeLinecap="round" /></svg>
                            </div>
                            <div className="flex-1">
                                <div className="font-['Fraunces',_serif] text-lg font-semibold text-[#3D2B1F]">Pay electricity bill</div>
                                <div className="text-sm text-[#8C7B6B] font-light">Due March 15 · Reminder set</div>
                            </div>
                            <div className="text-xs font-medium px-3 py-1 bg-[#F0D5C4] text-[#C8714A] rounded-full">Today</div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 p-8">
                        <h3 className="font-['Fraunces',_serif] text-2xl font-semibold text-[#3D2B1F] mb-4">Financial & Events</h3>
                        <p className="text-[#8C7B6B] font-light leading-relaxed text-lg">
                            Manage expenses, due dates and grocery lists cooperatively. Less arguments over who bought what, and when.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-[#3D2B1F] py-24 mt-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(200,113,74,0.15)_0%,transparent_50%)]"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="font-['Fraunces',_serif] text-4xl md:text-5xl font-bold text-[#F5EFE6] mb-8">
                        Ready to bring order to your home?
                    </h2>
                    <p className="text-[#8C7B6B] text-xl mb-12 max-w-2xl mx-auto font-light">
                        Join families around the world who've replaced their messy whiteboards with one beautifully calm hub.
                    </p>
                    <Link href="/auth">
                        <Button className="h-14 bg-[#C8714A] hover:bg-[#A3462A] text-white rounded-full px-10 text-lg font-medium shadow-[0_8px_20px_rgba(200,113,74,0.3)] hover:-translate-y-0.5 transition-all">
                            Sign up free
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#3D2B1F] border-t border-white/5 py-12 text-center text-[#8C7B6B] text-xs uppercase tracking-[0.1em] font-medium">
                <div className="max-w-7xl mx-auto px-6">
                    <span className="font-['Fraunces',_serif] italic text-[#C8714A] text-[14px] normal-case tracking-normal font-semibold">HomeHub</span>
                    &nbsp;&nbsp;·&nbsp;&nbsp; Modern Home Management &nbsp;&nbsp;·&nbsp;&nbsp; 2025
                </div>
            </footer>
        </div>
    );
}
