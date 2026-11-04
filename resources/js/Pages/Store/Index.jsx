import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Box,
    Gamepad2,
    Bot,
    Database,
    Globe,
    ArrowRight,
    Zap,
    Shield,
    Cpu,
    HardDrive,
    Server,
    Sparkles,
    CheckCircle2,
    Clock,
    Flame,
    Gauge,
    Layers,
    Activity,
    Terminal,
    Car
} from 'lucide-react';

const CATEGORY_META = {
    minecraft: {
        icon: Box,
        code: 'CLUSTER-MC',
        color: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        borderHover: 'group-hover:border-emerald-400',
        glowHover: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
        accentText: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
        badge: 'PAPER · PURPUR · FABRIC · FORGE',
        specs: ['Desde 2 GB a 16 GB DDR5', 'Java 8/17/21 & Bedrock', 'Instalador de Modpacks 1-Click'],
        serversCount: '6 Planes Disponibles',
    },
    games: {
        icon: Gamepad2,
        code: 'CLUSTER-GAMES',
        color: 'from-pink-500/20 via-rose-500/10 to-transparent',
        borderHover: 'group-hover:border-pink-500',
        glowHover: 'group-hover:shadow-[0_0_30px_rgba(255,0,128,0.25)]',
        accentText: 'text-pink-400',
        badgeBg: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
        badge: 'PALWORLD · RUST · CS2 · ARK',
        specs: ['Hasta 32 GB RAM DDR5', '600% vCPU Ryzen 9', 'Baja Latencia Competitiva'],
        serversCount: '4 Planes Disponibles',
    },
    bots: {
        icon: Bot,
        code: 'CLUSTER-APPS',
        color: 'from-cyan-500/20 via-blue-500/10 to-transparent',
        borderHover: 'group-hover:border-[#00f7ff]',
        glowHover: 'group-hover:shadow-[0_0_30px_rgba(0,247,255,0.25)]',
        accentText: 'text-[#00f7ff]',
        badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
        badge: 'NODE.JS · PYTHON · JAVA · GO',
        specs: ['Reinicio Automático 24/7', 'Logs en Tiempo Real', 'Uptime 99.98% Garantizado'],
        serversCount: '3 Planes Disponibles',
    },
    databases: {
        icon: Database,
        code: 'CLUSTER-STORAGE',
        color: 'from-purple-500/20 via-indigo-500/10 to-transparent',
        borderHover: 'group-hover:border-purple-400',
        glowHover: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]',
        accentText: 'text-purple-400',
        badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
        badge: 'REDIS · MARIADB · POSTGRES · MONGO',
        specs: ['Acceso Remoto Seguro SSL', 'Backups Diarios Cifrados', 'NVMe SSD Gen4 Raid 10'],
        serversCount: '3 Planes Disponibles',
    },
    roleplay: {
        icon: Car,
        code: 'CLUSTER-RP',
        color: 'from-orange-500/20 via-red-500/10 to-transparent',
        borderHover: 'group-hover:border-orange-400',
        glowHover: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]',
        accentText: 'text-orange-400',
        badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
        badge: 'FIVEM · REDM · ALT:V · MTA · SA-MP',
        specs: ['txAdmin incluido en FiveM/RedM', 'Recursos y scripts personalizados', 'Licencia Cfx.re gratuita (la pones tú)'],
    },
    web: {
        icon: Globe,
        code: 'CLUSTER-WEB',
        color: 'from-amber-500/20 via-orange-500/10 to-transparent',
        borderHover: 'group-hover:border-amber-400',
        glowHover: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]',
        accentText: 'text-amber-400',
        badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        badge: 'PHP · WORDPRESS · NODE.JS · SSL',
        specs: ['Certificado SSL incluido', 'Bases de datos MariaDB', 'NVMe SSD Gen4 Raid 10'],
        serversCount: 'Planes Disponibles',
    },
};

const STATS = [
    { label: 'Tiempo de Despliegue', value: '< 60s', icon: Zap, detail: 'Aprovisionamiento instantáneo Wings' },
    { label: 'Mitigación DDoS', value: '2.5 Tbps', icon: Shield, detail: 'Filtros Game L3/L4/L7 Always-On' },
    { label: 'Frecuencia CPU', value: '5.7 GHz', icon: Cpu, detail: 'AMD Ryzen 9 7950X / EPYC Milan' },
    { label: 'Uptime Red SLA', value: '99.98%', icon: Gauge, detail: 'Backbone de 10 Gbps en Miami' },
];

const FEATURES = [
    {
        title: 'Hardware de Élite sin Sobreventa',
        desc: 'Procesadores AMD Ryzen 9 de última generación con frecuencias mononúcleo de hasta 5.7 GHz y memoria DDR5 de 5200 MHz con corrección ECC.',
        icon: Cpu,
    },
    {
        title: 'Panel Cinammon 2.0 Integrado',
        desc: 'Consola interactiva con soporte ANSI/xterm, explorador de archivos con edición en vivo, control de energía en tiempo real y subcuentas.',
        icon: Terminal,
    },
    {
        title: 'Protección Anti-DDoS Especializada',
        desc: 'Nuestra red filtra ataques volumétricos y específicos para motores de juego como Minecraft, Source Engine y UDP sin latencia añadida.',
        icon: Shield,
    },
    {
        title: 'Backups y Recuperación Rápida',
        desc: 'Copias de seguridad automáticas y programadas con almacenamiento fuera del nodo para restaurar tu progreso en segundos.',
        icon: HardDrive,
    },
];

export default function StoreIndex({ categories }) {
    return (
        <PublicLayout>
            <Head title="Tienda de Servidores Cloud" />

            {/* HERO SECTION */}
            <section className="relative px-4 pt-12 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl text-center">
                    {/* Badge de estado del clúster */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-mono tracking-wider text-pink-300 shadow-[0_0_15px_rgba(255,0,128,0.2)]">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f7ff] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f7ff]"></span>
                        </span>
                        <span>CLUSTER REGION: US-EAST (MIAMI, FL) // STOCK DISPONIBLE</span>
                    </div>

                    {/* Título Principal */}
                    <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-none">
                        POTENCIA <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-[#00f7ff] bg-clip-text text-transparent">CYBERPUNK</span>
                        <br />
                        PARA TUS SERVIDORES
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
                        Infraestructura cloud de alto rendimiento para comunidades exigentes. Despliegue en 60 segundos,
                        protección Anti-DDoS Game de 2.5 Tbps y panel de control <strong className="text-pink-400">Cinammon 2.0</strong> en tiempo real.
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
                        {STATS.map((s, idx) => {
                            const Icon = s.icon;
                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center rounded-xl border border-slate-800 bg-[#070b18]/80 p-4 backdrop-blur-md transition hover:border-pink-500/40"
                                >
                                    <Icon size={20} className="mb-2 text-[#00f7ff]" />
                                    <span className="font-mono text-2xl font-black text-white">{s.value}</span>
                                    <span className="mt-0.5 text-xs font-semibold text-slate-300">{s.label}</span>
                                    <span className="mt-1 text-[10px] text-slate-500 text-center leading-tight">{s.detail}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CATEGORIES GRID */}
                <div className="mx-auto mt-20 max-w-6xl">
                    <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                        <div>
                            <div className="font-mono text-xs font-bold uppercase tracking-widest text-pink-400">
                                // LÍNEAS DE PRODUCTO DISPONIBLES
                            </div>
                            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                                Selecciona tu Categoría de Servidor
                            </h2>
                        </div>
                        <span className="font-mono text-xs text-slate-400">
                            Aprovisionamiento automático 24/7 con Docker & Wings
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {categories.map((c) => {
                            const meta = CATEGORY_META[c.key] || {
                                icon: Server,
                                code: 'CLUSTER-SYS',
                                color: 'from-pink-500/20 to-transparent',
                                borderHover: 'group-hover:border-pink-500',
                                glowHover: 'group-hover:shadow-[0_0_30px_rgba(255,0,128,0.25)]',
                                accentText: 'text-pink-400',
                                badgeBg: 'bg-pink-500/10 border-pink-500/30 text-pink-300',
                                badge: 'MULTI-ENVIRONMENT',
                                specs: ['Configuración personalizada'],
                                serversCount: 'Planes activos',
                            };
                            const Icon = meta.icon;

                            return (
                                <Link
                                    key={c.key}
                                    href={route('store.category', c.key)}
                                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b ${meta.color} bg-[#060914] p-7 transition-all duration-300 hover:-translate-y-1 ${meta.borderHover} ${meta.glowHover}`}
                                >
                                    {/* Top Bar inside Card */}
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-black/60 shadow-inner group-hover:scale-105 transition-transform">
                                                    <Icon size={24} className={meta.accentText} />
                                                </div>
                                                <div>
                                                    <span className="font-mono text-[10px] font-bold tracking-widest text-slate-500">
                                                        [{meta.code}]
                                                    </span>
                                                    <h3 className="text-xl font-black text-white group-hover:text-pink-300 transition-colors">
                                                        {c.title}
                                                    </h3>
                                                </div>
                                            </div>
                                            <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${meta.badgeBg}`}>
                                                {c.plans_count} {c.plans_count === 1 ? 'Plan' : 'Planes'}
                                            </span>
                                        </div>

                                        <p className="mt-4 text-sm leading-relaxed text-slate-300">
                                            {c.tagline}
                                        </p>

                                        {c.eggs?.length > 0 && (
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                {c.eggs.map((egg) => (
                                                    <img
                                                        key={egg.name}
                                                        src={egg.icon}
                                                        alt={egg.name}
                                                        title={egg.name}
                                                        width={32}
                                                        height={32}
                                                        loading="lazy"
                                                        className="h-8 w-8 rounded-md border border-slate-700/80 bg-black/40 object-cover"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Software / Framework Chips */}
                                        <div className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-slate-800/80 bg-black/40 px-3 py-1 font-mono text-[10px] text-slate-400">
                                            <Sparkles size={11} className="text-[#00f7ff]" />
                                            <span>{meta.badge}</span>
                                        </div>

                                        {/* Key specs list */}
                                        <ul className="mt-5 space-y-2 border-t border-slate-800/80 pt-4 text-xs text-slate-300">
                                            {meta.specs.map((spec, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <CheckCircle2 size={13} className={meta.accentText} />
                                                    <span>{spec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Card Footer: Price & CTA */}
                                    <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-5">
                                        <div>
                                            <span className="block font-mono text-[11px] text-slate-400">PRECIO DE PARTIDA</span>
                                            {c.from != null ? (
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xs text-slate-400">desde</span>
                                                    <span className="font-mono text-2xl font-black text-[#00f7ff]">
                                                        {c.from.toFixed(2)} €
                                                    </span>
                                                    <span className="font-mono text-xs text-slate-400">/ mes</span>
                                                </div>
                                            ) : (
                                                <span className="font-mono text-sm font-semibold text-slate-300">Consultar</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 rounded-xl border border-pink-500/40 bg-pink-500/10 px-4 py-2 font-mono text-xs font-bold text-pink-300 shadow-[0_0_12px_rgba(255,0,128,0.2)] transition group-hover:border-[#00f7ff] group-hover:bg-[#00f7ff] group-hover:text-black group-hover:shadow-[0_0_20px_rgba(0,247,255,0.4)]">
                                            <span>Ver Planes</span>
                                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* HARDWARE & CLUSTER ARCHITECTURE SECTION */}
                <div className="mx-auto mt-24 max-w-6xl rounded-2xl border border-slate-800 bg-[#070b18]/80 p-8 sm:p-12 backdrop-blur-xl">
                    <div className="max-w-2xl">
                        <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#00f7ff]">
                            // INFRAESTRUCTURA DE NIVEL EMPRESARIAL
                        </div>
                        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                            ¿Por qué elegir los nodos de Cinammon?
                        </h2>
                        <p className="mt-3 text-sm text-slate-300">
                            No utilizamos servidores reacondicionados ni compartimos recursos por encima de la capacidad de la máquina.
                            Cada vCPU y cada megabyte de RAM asignado está garantizado para tu instancia.
                        </p>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((f, idx) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-slate-800/80 bg-black/40 p-5 transition hover:border-pink-500/40"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-400">
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="mt-4 font-mono text-sm font-bold text-white">{f.title}</h3>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Terminal Flow diagram */}
                    <div className="mt-10 rounded-xl border border-slate-800 bg-black/70 p-5 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
                                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 inline-block" />
                                <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />
                                <span className="ml-2 text-[11px] text-slate-400">cinammon-provisioner --workflow-v2</span>
                            </div>
                            <span className="text-[10px] text-[#00f7ff]">STATUS: READY</span>
                        </div>
                        <div className="pt-3 space-y-1 text-slate-300">
                            <p><span className="text-pink-400">$</span> checkout --plan=&quot;diamond-8gb&quot; --datacenter=&quot;miami-us-01&quot;</p>
                            <p className="text-slate-500">→ [00.12s] Token HMAC validado contra clúster daemon Wings.</p>
                            <p className="text-slate-500">→ [00.35s] Contenedor Docker aislado creado en red puente de alta velocidad.</p>
                            <p className="text-slate-500">→ [00.58s] Reglas iptables y mitigación Anti-DDoS sincronizadas.</p>
                            <p className="text-emerald-400">✓ [00.94s] Instancia lista: panel.cinammon.net/servers/&lt;uuid&gt;/console</p>
                        </div>
                    </div>
                </div>

                {/* 4 STEPS HOW IT WORKS */}
                <div className="mx-auto mt-24 max-w-6xl text-center">
                    <div className="font-mono text-xs font-bold uppercase tracking-widest text-pink-400">
                        // DESPLIEGUE EN 4 PASOS
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                        De la Tienda a tu Servidor en Menos de 1 Minuto
                    </h2>

                    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { step: '01', title: 'Elige tu Plan', desc: 'Selecciona la memoria RAM y capacidad necesaria para tu proyecto.' },
                            { step: '02', title: 'Personaliza', desc: 'Define el nombre del servidor y tu configuración inicial deseada.' },
                            { step: '03', title: 'Aprovisionamiento', desc: 'Wings crea el contenedor Docker en nuestros nodos en 30 segundos.' },
                            { step: '04', title: 'Control Total', desc: 'Accede a la consola interactiva Cinammon 2.0 y disfruta de tu servidor.' },
                        ].map((s) => (
                            <div
                                key={s.step}
                                className="relative rounded-xl border border-slate-800 bg-[#070b18]/60 p-6 text-left transition hover:border-[#00f7ff]/40"
                            >
                                <span className="font-mono text-3xl font-black text-pink-500/40">{s.step}</span>
                                <h3 className="mt-2 font-mono text-base font-bold text-white">{s.title}</h3>
                                <p className="mt-1 text-xs text-slate-400">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
