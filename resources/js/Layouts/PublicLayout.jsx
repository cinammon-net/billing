import { Link, usePage } from '@inertiajs/react';
import MaintenanceBanner from '@/Components/MaintenanceBanner';
import StoreNav from '@/Components/StoreNav';
import PromoStrip from '@/Components/PromoStrip';
import { Activity, Shield, Sparkles, Zap } from 'lucide-react';


export default function PublicLayout({ children }) {
    const { auth, panelUrl } = usePage().props;

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#04060d] font-sans text-slate-100 antialiased selection:bg-pink-500 selection:text-white">
            {/* Fondo ambiental Cyberpunk */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />
                <div className="absolute top-1/2 -right-40 h-[450px] w-[450px] rounded-full bg-pink-500/10 blur-[150px]" />
                <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-[140px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-[length:24px_24px] opacity-[0.06]" />
            </div>

            <StoreNav />

            <MaintenanceBanner />

            <PromoStrip />

            {/* Contenido dinámico */}
            <main className="relative z-10 flex-1">{children}</main>

            {/* FOOTER CYBER */}
            <footer className="relative z-10 border-t border-pink-500/20 bg-[#060a16]/90 py-10 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Mini badges de garantía */}
                    <div className="grid grid-cols-2 gap-4 pb-8 border-b border-neutral-800/80 sm:grid-cols-4 font-mono text-xs">
                        <div className="flex items-center gap-2.5 text-slate-300">
                            <Zap size={18} className="text-[#00f7ff] shrink-0" />
                            <span>Despliegue &lt; 60 Segundos</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                            <Shield size={18} className="text-pink-400 shrink-0" />
                            <span>Anti-DDoS 3.2 Tbps Ready</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                            <Activity size={18} className="text-emerald-400 shrink-0" />
                            <span>Wings V2 Daemon Engine</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                            <Sparkles size={18} className="text-purple-400 shrink-0" />
                            <span>AMD Ryzen 9 & DDR5 NVMe</span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center justify-between gap-4 font-mono text-xs text-slate-400 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white">CINAMMON.NET</span>
                            <span>// Cloud Hosting & Orchestration Infrastructure</span>
                        </div>
                        <div className="flex items-center gap-5 text-slate-400">
                            <a href={panelUrl} className="hover:text-pink-300 transition">Web Principal</a>
                            <Link href={route('store')} className="hover:text-pink-300 transition">Catálogo</Link>
                            <a href={`${panelUrl}/tickets`} className="hover:text-pink-300 transition">Soporte 24/7</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
