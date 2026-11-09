import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { fmtPrice } from '@/lib/price';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Clock, X } from 'lucide-react';

const METHOD_LABELS = { transfer: 'Transferencia', bizum: 'Bizum', crypto: 'Cripto', paypal: 'PayPal', simulated: 'Simulado' };

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '—');

export default function Payments({ awaiting, recent, methods }) {
    const { auth } = usePage().props;

    const confirmPay = (inv) => {
        if (confirm(`¿Confirmas que has recibido ${fmtPrice(inv.amount)} € de ${inv.user?.name ?? 'este cliente'} (${inv.number})? Se activará su servicio.`)) {
            router.post(route('admin.payments.confirm', inv.id), {}, { preserveScroll: true });
        }
    };

    const rejectPay = (inv) => {
        const note = prompt(`Motivo para el cliente (${inv.number}):`, 'No hemos encontrado el ingreso con ese concepto.');
        if (note) router.post(route('admin.payments.reject', inv.id), { admin_note: note }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pagos" />
            <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
                <div>
                    <h1 className="text-2xl font-black text-white">Pagos</h1>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                        Métodos activos: {methods.length ? methods.map((m) => m.label).join(' · ') : 'ninguno'} ·{' '}
                        <Link href={route('admin.payment-methods.index')} className="text-neon underline hover:text-white">
                            configurar métodos de pago
                        </Link>
                    </p>
                </div>

                <section className="rounded-2xl border border-amber-500/30 bg-[#070b18]/90">
                    <h2 className="flex items-center gap-2 border-b border-slate-800 px-5 py-3 font-mono text-xs font-bold tracking-widest text-amber-300 uppercase">
                        <Clock size={14} /> Pendientes de confirmar ({awaiting.length})
                    </h2>
                    {awaiting.length === 0 ? (
                        <p className="px-5 py-6 text-sm text-slate-400">No hay transferencias ni Bizums pendientes.</p>
                    ) : (
                        <ul className="divide-y divide-slate-800">
                            {awaiting.map((inv) => (
                                <li key={inv.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-mono text-sm font-bold text-white">
                                            {inv.number} · {fmtPrice(inv.amount)} € · <span className="text-amber-300">{METHOD_LABELS[inv.method] ?? inv.method}</span>
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {inv.user?.name} ({inv.user?.email}) · {inv.concept} · avisó {fmtDate(inv.updated_at)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-200">
                                            Indica: <strong>{inv.payer_note}</strong> — busca en tu banco/Bizum el concepto <strong>{inv.number}</strong>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => confirmPay(inv)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/60 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-black"
                                        >
                                            <Check size={13} /> Confirmar
                                        </button>
                                        <button
                                            onClick={() => rejectPay(inv)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/30"
                                        >
                                            <X size={13} /> Rechazar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-800 bg-[#070b18]/90">
                    <h2 className="border-b border-slate-800 px-5 py-3 font-mono text-xs font-bold tracking-widest text-slate-300 uppercase">Últimos pagos recibidos</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="font-mono text-[10px] text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-2">Factura</th>
                                    <th className="px-5 py-2">Cliente</th>
                                    <th className="px-5 py-2">Importe</th>
                                    <th className="px-5 py-2">Método</th>
                                    <th className="px-5 py-2">Pagada</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {recent.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="px-5 py-2 font-mono">{inv.number}</td>
                                        <td className="px-5 py-2">{inv.user?.email}</td>
                                        <td className="px-5 py-2 font-mono">{fmtPrice(inv.amount)} €</td>
                                        <td className="px-5 py-2">{METHOD_LABELS[inv.method] ?? inv.method ?? '—'}</td>
                                        <td className="px-5 py-2">{fmtDate(inv.paid_at)}</td>
                                    </tr>
                                ))}
                                {recent.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-6 text-slate-500">
                                            Aún no hay pagos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
