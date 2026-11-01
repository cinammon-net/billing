import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';

const fmtRam = (mb) => (mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('es-ES') : '—');

const STATUS = {
    active: { label: 'Activo', cls: 'bg-[#00f7ff]/10 text-[#00f7ff] border-[#00f7ff]/40' },
    pending: { label: 'Pendiente de pago', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40' },
    suspended: { label: 'Suspendido', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40' },
    cancelled: { label: 'Cancelado', cls: 'bg-red-500/10 text-red-400 border-red-500/40' },
    paid: { label: 'Pagada', cls: 'bg-[#00f7ff]/10 text-[#00f7ff] border-[#00f7ff]/40' },
    overdue: { label: 'Vencida', cls: 'bg-red-500/10 text-red-400 border-red-500/40' },
};

const Badge = ({ status }) => {
    const s = STATUS[status] ?? { label: status, cls: 'border-gray-500/40 text-gray-300' };
    return <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
};

const Card = ({ title, action, children }) => (
    <div className="overflow-hidden rounded-xl border border-pink-500/40 bg-black/60 shadow-[0_0_20px_rgba(255,0,150,0.2)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-pink-500/20 px-6 py-4">
            <h3 className="font-bold tracking-wide text-pink-400">{title}</h3>
            {action}
        </div>
        {children}
    </div>
);

export default function Dashboard({ auth, orders, invoices }) {
    const { panelUrl, flash } = usePage().props;
    const active = orders.filter((o) => o.status === 'active');
    const pendingInvoices = invoices.filter((i) => i.status !== 'paid');

    const cancelOrder = (order) => {
        if (confirm(`¿Cancelar el servicio «${order.server_name}»?`)) {
            router.post(route('orders.cancel', order.id));
        }
    };

    const payInvoice = (invoice) => {
        if (confirm(`¿Pagar la factura ${invoice.number} (${invoice.amount.toFixed(2)} €)?`)) {
            router.post(route('invoices.pay', invoice.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight tracking-wide text-pink-400">Área de clientes</h2>}
        >
            <Head title="Mis servicios" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="rounded-xl border border-[#00f7ff]/40 bg-[#00f7ff]/10 px-6 py-4 text-sm font-semibold text-[#00f7ff]">
                            {flash.success}
                        </div>
                    )}

                    {/* RESUMEN */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {[
                            { title: 'Servicios activos', value: active.length, accent: 'text-[#00f7ff]' },
                            { title: 'Facturas pendientes', value: pendingInvoices.length, accent: 'text-pink-400' },
                            {
                                title: 'Próxima renovación',
                                value: active.length ? fmtDate(active.map((o) => o.renews_at).sort()[0]) : '—',
                                accent: 'text-fuchsia-400',
                            },
                        ].map((card) => (
                            <div
                                key={card.title}
                                className="rounded-xl border border-pink-500/40 bg-black/60 p-6 shadow-[0_0_15px_rgba(255,0,150,0.15)] backdrop-blur-sm"
                            >
                                <p className="text-sm text-gray-400">{card.title}</p>
                                <p className={`mt-2 text-3xl font-bold tracking-wide ${card.accent}`}>{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* SERVICIOS */}
                    <Card
                        title="Mis servicios"
                        action={
                            <Link href={route('store')}>
                                <PrimaryButton>+ Contratar nuevo</PrimaryButton>
                            </Link>
                        }
                    >
                        {orders.length === 0 ? (
                            <p className="px-6 py-8 text-sm text-gray-400">
                                Aún no tienes servicios.{' '}
                                <Link href={route('store')} className="text-pink-300 underline hover:text-pink-200">
                                    Visita la tienda
                                </Link>{' '}
                                para contratar el primero.
                            </p>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase tracking-wider text-gray-400">
                                    <tr className="border-b border-pink-500/20">
                                        <th className="px-6 py-3">Servidor</th>
                                        <th className="px-6 py-3">Plan</th>
                                        <th className="hidden px-6 py-3 sm:table-cell">Specs</th>
                                        <th className="px-6 py-3">Precio</th>
                                        <th className="hidden px-6 py-3 sm:table-cell">Renueva</th>
                                        <th className="px-6 py-3">Estado</th>
                                        <th className="px-6 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o.id} className="border-b border-pink-500/10 hover:bg-pink-500/5">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-white">{o.server_name}</div>
                                                {o.server_address && (
                                                    <div className="mt-0.5 font-mono text-xs text-[#00f7ff]">{o.server_address}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-pink-300">{o.plan?.name}</td>
                                            <td className="hidden px-6 py-4 text-gray-300 sm:table-cell">
                                                {o.plan ? `${fmtRam(o.plan.ram_mb)} · ${o.plan.storage_gb} GB` : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-white">{o.price.toFixed(2)} €/mes</td>
                                            <td className="hidden px-6 py-4 text-gray-300 sm:table-cell">{fmtDate(o.renews_at)}</td>
                                            <td className="px-6 py-4"><Badge status={o.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {o.status === 'active' && (
                                                        <a
                                                            href={o.panel_server_id ? `${panelUrl}/servers/${o.panel_server_id}/console` : `${panelUrl}/servers`}
                                                            className="rounded-md border border-[#00f7ff]/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#00f7ff] transition hover:bg-[#00f7ff] hover:text-black"
                                                        >
                                                            Gestionar
                                                        </a>
                                                    )}
                                                    {o.status === 'pending' && (
                                                        <span className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-yellow-400">
                                                            Esperando pago
                                                        </span>
                                                    )}
                                                    {(o.status === 'active' || o.status === 'pending') && (
                                                        <DangerButton onClick={() => cancelOrder(o)}>Cancelar</DangerButton>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>

                    {/* FACTURAS */}
                    <Card title="Facturas">
                        {invoices.length === 0 ? (
                            <p className="px-6 py-8 text-sm text-gray-400">No hay facturas todavía.</p>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs uppercase tracking-wider text-gray-400">
                                    <tr className="border-b border-pink-500/20">
                                        <th className="px-6 py-3">Nº factura</th>
                                        <th className="px-6 py-3">Servicio</th>
                                        <th className="px-6 py-3">Importe</th>
                                        <th className="hidden px-6 py-3 sm:table-cell">Fecha</th>
                                        <th className="px-6 py-3">Estado</th>
                                        <th className="px-6 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="border-b border-pink-500/10 hover:bg-pink-500/5">
                                            <td className="px-6 py-4 font-mono text-[#00f7ff]">{inv.number}</td>
                                            <td className="px-6 py-4 text-white">{inv.order?.server_name ?? '—'}</td>
                                            <td className="px-6 py-4 text-white">{inv.amount.toFixed(2)} €</td>
                                            <td className="hidden px-6 py-4 text-gray-300 sm:table-cell">{fmtDate(inv.created_at)}</td>
                                            <td className="px-6 py-4"><Badge status={inv.status} /></td>
                                            <td className="px-6 py-4 text-right">
                                                {inv.status !== 'paid' && (
                                                    <PrimaryButton onClick={() => payInvoice(inv)}>Pagar</PrimaryButton>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>

                    {/* ENLACE AL PANEL */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#00f7ff]/40 bg-black/60 p-6 shadow-[0_0_20px_rgba(0,247,255,0.15)] backdrop-blur-sm">
                        <div>
                            <h3 className="font-bold tracking-wide text-[#00f7ff]">Cinammon Panel</h3>
                            <p className="mt-1 text-sm text-gray-300">
                                Gestiona tus servidores: consola, archivos, backups y más en la web principal.
                            </p>
                        </div>
                        <a
                            href={`${panelUrl}/dashboard`}
                            className="rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2 font-semibold text-black shadow transition hover:from-cyan-300 hover:to-blue-400"
                        >
                            Ir al panel →
                        </a>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
