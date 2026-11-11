import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Bot,
    Box,
    Check,
    CheckCircle2,
    Clock,
    Coins,
    Cpu,
    Flame,
    Gift,
    Globe,
    HardDrive,
    HelpCircle,
    Layers,
    LogIn,
    Radio,
    Server,
    Shield,
    Sparkles,
    UserPlus,
    Users,
    Zap,
} from 'lucide-react';

export default function StoreFree({ settings = {}, stats = null, options = [], catalog = [] }) {
    const { auth, panelUrl, billingUrl } = usePage().props;
    const loginHref = `${panelUrl}/billing/redirect`;
    const registerHref = billingUrl ? `${billingUrl}/register` : '/register';
    const coinsHref = billingUrl ? `${billingUrl}/coins` : '/coins';

    const activeCount = stats?.active ?? 0;
    const peopleCount = stats?.people ?? 0;

    const FREE_SERVICES = [
        {
            title: 'Minecraft Gratis',
            category: 'minecraft',
            tag: 'GAMING // PAPER & FORGE',
            icon: Box,
            tint: 'text-emerald-400',
            border: 'border-emerald-500/30 hover:border-emerald-400',
            glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
            ram: '1024 MB DDR5',
            cpu: '50% vCPU Ryzen 9',
            disk: '5 GB NVMe',
            desc: 'Servidor completo de Paper, Purpur, Fabric o Spigot. Soporta plugins, consola en tiempo real y subdominio propio.',
        },
        {
            title: 'Bot de WhatsApp',
            category: 'bots',
            tag: 'AUTOMATION // BAILEYS & WPP',
            icon: Bot,
            tint: 'text-emerald-400',
            border: 'border-emerald-500/30 hover:border-emerald-400',
            glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
            ram: '512 - 1024 MB DDR5',
            cpu: '50% vCPU Ryzen 9',
            disk: '5 GB NVMe',
            desc: 'Alojamiento para bots de WhatsApp con Node.js 22 LTS o Python 3.12. Escaneo de QR en consola y sesión persistente.',
        },
        {
            title: 'Bot de Telegram',
            category: 'bots',
            tag: 'AUTOMATION // AIOGRAM & TELETHON',
            icon: Bot,
            tint: 'text-blue-400',
            border: 'border-blue-500/30 hover:border-blue-400',
            glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
            ram: '512 MB DDR5',
            cpu: '50% vCPU Ryzen 9',
            disk: '5 GB NVMe',
            desc: 'Bots de alta velocidad en Python (aiogram, Telethon) o Node.js (grammY, Telegraf) con polling continuo y webhooks.',
        },
        {
            title: 'Bot de Discord & Apps',
            category: 'bots',
            tag: 'APPS // NODE & PYTHON',
            icon: Radio,
            tint: 'text-purple-400',
            border: 'border-purple-500/30 hover:border-purple-400',
            glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
            ram: '512 MB DDR5',
            cpu: '50% vCPU Ryzen 9',
            disk: '2 GB NVMe',
            desc: 'Discord.js, Discord.py, Eris y aplicaciones genéricas. 24/7 online con reinicio automático si el proceso falla.',
        },
        {
            title: 'Hosting Web & PHP',
            category: 'web',
            tag: 'WEB // NGINX & PHP 8.3',
            icon: Globe,
            tint: 'text-pink-400',
            border: 'border-pink-500/30 hover:border-pink-400',
            glow: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]',
            ram: '512 MB DDR5',
            cpu: '25% vCPU Ryzen 9',
            disk: '2 GB NVMe',
            desc: 'Alojamiento web con Nginx, PHP 8.3 y soporte para bases de datos SQLite o MariaDB vinculadas.',
        },
        {
            title: 'Bases de Datos & Juegos Clásicos',
            category: 'databases',
            tag: 'DATABASE // REDIS & MARIADB',
            icon: Server,
            tint: 'text-yellow-400',
            border: 'border-yellow-500/30 hover:border-yellow-400',
            glow: 'hover:shadow-[0_0_30px_rgba(250,204,21,0.2)]',
            ram: '512 MB DDR5',
            cpu: '25% vCPU Ryzen 9',
            disk: '2 GB NVMe',
            desc: 'Instancias Redis o MariaDB para tus proyectos, o servidores de juegos clásicos ligeros (Terraria, Teeworlds).',
        },
    ];

    const HOW_IT_WORKS = [
        {
            step: '01',
            title: 'Crea tu cuenta gratis',
            desc: 'Regístrate en menos de 10 segundos. No necesitas tarjeta de crédito ni vincular métodos de pago.',
            icon: UserPlus,
            color: 'text-pink-400',
        },
        {
            step: '02',
            title: 'Gana monedas con facilidad',
            desc: 'Inicia sesión cada día para tu racha diaria, completa misiones de perfil y mira anuncios cortos opcionales (hasta 150 monedas/día).',
            icon: Flame,
            color: 'text-yellow-400',
        },
        {
            step: '03',
            title: 'Configura tu servidor gratis',
            desc: 'Elige tu entorno (Minecraft, bots, web), ajusta RAM, CPU y disco a tu medida y selecciona duración de 3, 7 o 14 días.',
            icon: Cpu,
            color: 'text-purple-400',
        },
        {
            step: '04',
            title: 'Despliegue y renovación 24/7',
            desc: 'Tu servidor se crea automáticamente en Wings en menos de 60 segundos. Renueva gratis cuantas veces quieras con monedas.',
            icon: Zap,
            color: 'text-emerald-400',
        },
    ];

    const FAQS = [
        {
            q: '¿Es realmente 100% gratuito?',
            a: 'Sí. No solicitamos datos de facturación ni tarjeta bancaria para utilizar los servidores gratuitos. Todo el servicio se gestiona mediante el sistema de monedas de recompensa.',
        },
        {
            q: '¿Cómo renuevo mi servidor cuando caduque?',
            a: 'Puedes renovarlo en cualquier momento desde el área de Monedas antes de su vencimiento. Además, te enviamos un aviso previo por correo para que no pierdas tus datos.',
        },
        {
            q: '¿Qué recursos incluye un servidor gratis?',
            a: 'Hasta 1024 MB de RAM DDR5, 50% de CPU AMD Ryzen 9 y 5 GB de almacenamiento SSD NVMe ultrarrápido, con protección Anti-DDoS Game de 2.5 Tbps incluida.',
        },
        {
            q: '¿Tengo acceso completo al panel de control?',
            a: 'Sí. Dispones de consola en tiempo real en el Panel Cinammon, gestor web de archivos, SFTP, configuración de variables de entorno y reinicio automático.',
        },
    ];

    return (
        <PublicLayout>
            <Head>
                <title>Servidores Gratis con Monedas · Cinammon Cloud</title>
                <meta
                    name="description"
                    content="Despliega servidores gratis de Minecraft, bots de WhatsApp, Telegram y hosting web en Cinammon Cloud con monedas de recompensa."
                />
            </Head>

            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header Cyberpunk */}
                <header className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-1.5 font-mono text-xs font-bold text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                        <Coins size={14} className="text-yellow-400" />
                        <span>// 100% GRATUITO · SIN TARJETA DE CRÉDITO</span>
                    </div>

                    <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        SERVIDORES GRATIS CON{' '}
                        <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                            MONEDAS
                        </span>
                    </h1>

                    <p className="mt-4 text-base text-slate-300 sm:text-lg">
                        Prueba la potencia de Cinammon Cloud sin coste. Acumula monedas con anuncios, rachas diarias y misiones
                        para desplegar servidores 24/7 con recursos dedicados y Anti-DDoS Game de 2.5 Tbps.
                    </p>

                    {/* Barra de métricas en vivo */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
                        {activeCount > 0 && (
                            <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-[#070b18]/80 px-4 py-2 text-yellow-300 shadow-sm">
                                <Activity size={14} className="text-yellow-400 animate-pulse" />
                                <span className="font-bold">{activeCount} servidores gratis activos</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#070b18]/80 px-4 py-2 text-slate-300">
                            <Shield size={14} className="text-pink-400" />
                            <span>Anti-DDoS 2.5 Tbps Game</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#070b18]/80 px-4 py-2 text-slate-300">
                            <Zap size={14} className="text-emerald-400" />
                            <span>Despliegue &lt; 60s en Wings</span>
                        </div>
                    </div>

                    {/* Botón CTA Principal Superior */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        {auth?.user ? (
                            <a
                                href={coinsHref}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-6 py-3.5 font-mono text-sm font-black text-black shadow-[0_0_25px_rgba(250,204,21,0.35)] transition hover:brightness-110 active:scale-95"
                            >
                                <Coins size={16} />
                                <span>Configurar Servidor Gratis Ahora</span>
                                <ArrowRight size={16} />
                            </a>
                        ) : (
                            <>
                                <a
                                    href={loginHref}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-6 py-3.5 font-mono text-sm font-black text-black shadow-[0_0_25px_rgba(250,204,21,0.35)] transition hover:brightness-110 active:scale-95"
                                >
                                    <LogIn size={16} />
                                    <span>Entrar para Reclamar Servidor</span>
                                    <ArrowRight size={16} />
                                </a>
                                <a
                                    href={registerHref}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-mono text-sm font-bold text-white transition hover:bg-white/10 active:scale-95"
                                >
                                    <UserPlus size={16} />
                                    <span>Crear Cuenta en 10s</span>
                                </a>
                            </>
                        )}
                    </div>
                </header>

                {/* Grid de Servicios Gratuitos Disponibles */}
                <section className="mt-20">
                    <div className="mb-8 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
                        <div>
                            <span className="font-mono text-xs font-bold uppercase tracking-widest text-yellow-400">
                                // CATÁLOGO GRATUITO
                            </span>
                            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                                Servidores que puedes solicitar con monedas
                            </h2>
                        </div>
                        <span className="font-mono text-xs text-slate-400">
                            Rendimiento idéntico a los planes de pago en procesadores Ryzen 9
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {FREE_SERVICES.map((srv, idx) => {
                            const Icon = srv.icon;
                            return (
                                <div
                                    key={idx}
                                    className={`group flex flex-col justify-between rounded-2xl border bg-[#060914] p-6 transition-all duration-300 hover:-translate-y-1 ${srv.border} ${srv.glow}`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-black/60 shadow-inner group-hover:scale-105 transition-transform">
                                                <Icon size={24} className={srv.tint} />
                                            </div>
                                            <span className="rounded-full border border-yellow-500/30 bg-yellow-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-yellow-300 uppercase tracking-wider">
                                                0.00 € / mes
                                            </span>
                                        </div>

                                        <span className="mt-4 block font-mono text-[10px] font-bold tracking-widest text-slate-500">
                                            [{srv.tag}]
                                        </span>
                                        <h3 className="mt-1 text-xl font-black text-white group-hover:text-yellow-200 transition">
                                            {srv.title}
                                        </h3>
                                        <p className="mt-2 text-xs leading-relaxed text-slate-300">
                                            {srv.desc}
                                        </p>

                                        {/* Specs list */}
                                        <div className="mt-5 space-y-2 border-t border-slate-800/80 pt-4 font-mono text-xs">
                                            <div className="flex items-center justify-between text-slate-300">
                                                <span className="flex items-center gap-1.5 text-slate-400">
                                                    <Cpu size={14} className="text-yellow-400" /> CPU
                                                </span>
                                                <span className="font-bold text-white">{srv.cpu}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-300">
                                                <span className="flex items-center gap-1.5 text-slate-400">
                                                    <Server size={14} className="text-emerald-400" /> Memoria
                                                </span>
                                                <span className="font-bold text-white">{srv.ram}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-300">
                                                <span className="flex items-center gap-1.5 text-slate-400">
                                                    <HardDrive size={14} className="text-pink-400" /> Almacenamiento
                                                </span>
                                                <span className="font-bold text-white">{srv.disk}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-800">
                                        <a
                                            href={auth?.user ? coinsHref : loginHref}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-400/30 bg-yellow-400/10 py-2.5 font-mono text-xs font-bold text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                                        >
                                            <Coins size={14} />
                                            <span>Reclamar con monedas</span>
                                            <ArrowRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Cómo funciona el sistema */}
                <section className="mt-24 rounded-3xl border border-slate-800 bg-[#070b18]/70 p-8 backdrop-blur-md sm:p-12">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-pink-400">
                            // PASO A PASO
                        </span>
                        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                            ¿Cómo conseguir tu servidor gratis?
                        </h2>
                        <p className="mt-2 text-sm text-slate-300">
                            Sin trampas ni suscripciones ocultas. Ganar monedas te permite desplegar y renovar servidores continuamente.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {HOW_IT_WORKS.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={idx}
                                    className="relative flex flex-col rounded-2xl border border-slate-800 bg-black/40 p-6 backdrop-blur-sm transition hover:border-slate-700"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-2xl font-black text-slate-600">
                                            {step.step}
                                        </span>
                                        <Icon size={22} className={step.color} />
                                    </div>
                                    <h3 className="mt-4 text-base font-bold text-white">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                                        {step.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Resumen de Recompensas */}
                    <div className="mt-10 rounded-2xl border border-yellow-500/20 bg-yellow-400/5 p-6 font-mono text-xs">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-3">
                                <Gift size={24} className="text-yellow-400 shrink-0" />
                                <div>
                                    <span className="block font-bold text-white">Formas rápidas de ganar monedas:</span>
                                    <span className="text-slate-400">Racha diaria de 7 días (hasta 25 monedas) · Misiones de cuenta (hasta 50 monedas) · Anuncios (hasta 150 monedas/día).</span>
                                </div>
                            </div>
                            <a
                                href={auth?.user ? coinsHref : loginHref}
                                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300"
                            >
                                <Coins size={14} />
                                <span>Ver Monedas y Tareas</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Preguntas frecuentes */}
                <section className="mt-24 mx-auto max-w-4xl">
                    <div className="text-center">
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-yellow-400">
                            // FAQ
                        </span>
                        <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                            Preguntas frecuentes sobre el modo gratuito
                        </h2>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {FAQS.map((faq, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border border-slate-800 bg-[#070b18]/80 p-6 transition hover:border-slate-700"
                            >
                                <h3 className="flex items-start gap-2.5 font-bold text-white">
                                    <HelpCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                                    <span>{faq.q}</span>
                                </h3>
                                <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Final */}
                <div className="mt-24 text-center">
                    <div className="mx-auto inline-flex flex-col items-center gap-4 rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-yellow-500/10 p-8 sm:p-12 shadow-[0_0_50px_rgba(236,72,153,0.15)]">
                        <h2 className="text-3xl font-black text-white sm:text-4xl">
                            ¿Listo para crear tu servidor gratis?
                        </h2>
                        <p className="max-w-xl text-sm text-slate-300">
                            Despliegue inmediato en Wings V2 con AMD Ryzen 9 DDR5 y protección Anti-DDoS Game de 2.5 Tbps.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {auth?.user ? (
                                <a
                                    href={coinsHref}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-3.5 font-mono text-sm font-black text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] transition hover:brightness-110 active:scale-95"
                                >
                                    <Coins size={16} />
                                    <span>Ir al Configurador de Servidor Gratis</span>
                                    <ArrowRight size={16} />
                                </a>
                            ) : (
                                <a
                                    href={loginHref}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-3.5 font-mono text-sm font-black text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] transition hover:brightness-110 active:scale-95"
                                >
                                    <LogIn size={16} />
                                    <span>Entrar o Crear Cuenta Gratis</span>
                                    <ArrowRight size={16} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
