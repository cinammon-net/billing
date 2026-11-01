import { Link, usePage } from '@inertiajs/react';

const CATEGORIES = [
    { key: 'minecraft', label: 'Minecraft' },
    { key: 'games', label: 'Juegos' },
    { key: 'bots', label: 'Bots' },
    { key: 'databases', label: 'Bases de datos' },
];

export default function PublicLayout({ children }) {
    const { auth, panelUrl } = usePage().props;

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-black font-sans text-white">
            <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-[length:22px_22px] opacity-10" />

            {/* NAVBAR — el logo lleva a la web principal */}
            <header className="sticky top-0 z-50 flex w-full flex-wrap items-center justify-between gap-4 border-b border-pink-600 bg-black/70 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <a href={panelUrl} title="Volver a cinammon.net">
                        <img src="/favicon.ico" alt="Cinammon.net Logo" className="h-10 transition hover:opacity-80 sm:h-12" draggable={false} />
                    </a>
                    <nav className="hidden gap-4 md:flex">
                        {CATEGORIES.map((c) => (
                            <Link
                                key={c.key}
                                href={route('store.category', c.key)}
                                className={`text-sm font-semibold transition ${
                                    route().current('store.category', c.key) ? 'text-pink-400' : 'text-gray-300 hover:text-pink-300'
                                }`}
                            >
                                {c.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <nav className="flex items-center gap-3">
                    <a
                        href={panelUrl}
                        className="hidden rounded-md border border-[#00f7ff]/60 px-4 py-2 text-sm font-semibold text-[#00f7ff] transition hover:bg-[#00f7ff] hover:text-black sm:block"
                    >
                        Web principal
                    </a>
                    {auth?.user ? (
                        <Link
                            href={route('dashboard')}
                            className="rounded-md bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-pink-600"
                        >
                            Mis servicios
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="rounded-md bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow hover:from-pink-600 hover:to-fuchsia-700"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                href={route('register')}
                                className="rounded-md border border-pink-400 px-4 py-2 text-sm font-semibold text-pink-300 transition hover:bg-pink-400 hover:text-black"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            <main className="relative z-10 flex-1">{children}</main>

            <footer className="relative z-10 border-t border-pink-600 bg-black/70 p-6 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-pink-300">
                    <span>© {new Date().getFullYear()} cinammon.net — Billing</span>
                    <nav className="flex gap-4">
                        <a href={panelUrl} className="hover:text-pink-200">Web principal</a>
                        <Link href={route('store')} className="hover:text-pink-200">Tienda</Link>
                        <a href={`${panelUrl}/tickets`} className="hover:text-pink-200">Soporte</a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
