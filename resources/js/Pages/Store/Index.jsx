import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

const ICONS = { minecraft: '⛏️', games: '🎮', bots: '🤖', databases: '🗄️' };

export default function StoreIndex({ categories }) {
    return (
        <PublicLayout>
            <Head title="Tienda" />

            <section className="px-6 py-16 text-center">
                <h1 className="text-3xl font-extrabold tracking-widest text-pink-400 sm:text-4xl">
                    <span className="text-[#00f7ff]">cinammon</span>.net Store
                </h1>
                <p className="mt-3 text-pink-300">Elige una categoría y despliega tu servidor en minutos.</p>

                <div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
                    {categories.map((c) => (
                        <Link
                            key={c.key}
                            href={route('store.category', c.key)}
                            className="group rounded-xl border border-pink-500/40 bg-black/60 p-8 text-left shadow-[0_0_15px_rgba(255,0,150,0.15)] backdrop-blur-sm transition hover:border-pink-500 hover:shadow-[0_0_25px_rgba(255,0,150,0.35)]"
                        >
                            <div className="mb-3 text-3xl">{ICONS[c.key]}</div>
                            <h2 className="text-xl font-bold tracking-wide text-pink-400 group-hover:text-pink-300">{c.title}</h2>
                            <p className="mt-2 text-sm text-gray-300">{c.tagline}</p>
                            {c.from != null && (
                                <p className="mt-4 text-sm font-semibold text-[#00f7ff]">
                                    Desde {c.from.toFixed(2)} €/mes
                                </p>
                            )}
                        </Link>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
