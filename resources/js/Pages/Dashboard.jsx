import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { fmtPrice, cycleUnit } from '@/lib/price';
import { 
    Server, 
    Receipt, 
    Calendar, 
    Cpu, 
    Plus, 
    Terminal, 
    AlertTriangle, 
    CheckCircle2, 
    Copy, 
    Check, 
    Trash2, 
    CreditCard, 
    ExternalLink,
    HardDrive,
    Activity,
    ShieldAlert
} from 'lucide-react';

const fmtRam = (mb) => (mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('es-ES') : '—');

const STATUS_CONFIG = {
    active: { 
        label: 'Activo', 
        badgeCls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]', 
        dotCls: 'bg-emerald-400' 
    },
    pending: { 
        label: 'Pendiente de Pago', 
        badgeCls: 'border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]', 
        dotCls: 'bg-amber-400' 
    },
    suspended: { 
        label: 'Suspendido', 
        badgeCls: 'border-rose-500/40 bg-rose-500/10 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]', 
        dotCls: 'bg-rose-400' 
    },
    cancelled: { 
        label: 'Cancelado (Detenido)', 
        badgeCls: 'border-rose-600/50 bg-rose-950/40 text-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.25)]', 
        dotCls: 'bg-rose-500' 
    },
    paid: { 
        label: 'Pagada', 
        badgeCls: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_10px_rgba(0,247,255,0.2)]', 
        dotCls: 'bg-cyan-400' 
    },
    overdue: { 
        label: 'Vencida', 
        badgeCls: 'border-rose-500/40 bg-rose-500/10 text-rose-300', 
        dotCls: 'bg-rose-400' 
    },
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] ?? { 
        label: status, 
        badgeCls: 'border-neutral-700 bg-neutral-900 text-neutral-300', 
        dotCls: 'bg-neutral-400' 
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold ${config.badgeCls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotCls} animate-pulse`} />
            {config.label}
        </span>
    );
};

export default function Dashboard({ auth, orders = [], invoices = [] }) {
    const { panelUrl, flash, billingCycles } = usePage().props;
    const [cancelModalOrder, setCancelModalOrder] = useState(null);
    const [copiedIp, setCopiedIp] = useState(null);

    const active = orders.filter((o) => o.status === 'active');
    const pendingInvoices = invoices.filter((i) => i.status !== 'paid');

    const handleCopyIp = (address) => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopiedIp(address);
        setTimeout(() => setCopiedIp(null), 2000);
    };

    const confirmCancel = () => {
        if (!cancelModalOrder) return;
        router.post(route('orders.cancel', cancelModalOrder.id), {}, {
            onFinish: () => setCancelModalOrder(null),
        });
    };

    const payInvoice = (invoice) => {
        if (confirm(`¿Pagar la factura ${invoice.number} (${fmtPrice(invoice.amount)} €)?`)) {
            router.post(route('invoices.pay', invoice.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mis Servicios & Facturación" />

            <div className="py-8 md:py-10">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* HERO HEADER */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-pink-500/20 pb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold tracking-widest text-[#00f7ff] uppercase">
                                    // CONTROL DE CLIENTE
                                </span>
                                <span className="rounded border border-pink-500/40 bg-pink-500/10 px-2 py-0.5 font-mono text-[10px] text-pink-300">
                                    ID: #{auth.user?.id}
                                </span>
                            </div>
                            <h1 className="mt-1 font-mono text-2xl font-black tracking-wide text-white sm:text-3xl">
                                MIS SERVICIOS & <span className="text-pink-400">FACTURACIÓN</span>
                            </h1>
                            <p className="mt-1 text-sm text-slate-400">
                                Gestiona tus instancias activas, pagos y aprovisionamientos automáticos en Cinammon.net.
                            </p>
                        </div>

                        <Link
                            href={route('store')}
                            className="group flex items-center justify-center gap-2 rounded-xl border border-[#00f7ff]/50 bg-gradient-to-r from-[#00f7ff]/20 to-pink-500/20 px-5 py-3 font-mono text-xs font-bold text-white shadow-[0_0_20px_rgba(0,247,255,0.25)] transition hover:brightness-125 hover:shadow-[0_0_25px_rgba(0,247,255,0.4)]"
                        >
                            <Plus size={16} className="text-[#00f7ff] transition group-hover:rotate-90" />
                            <span>Contratar Nuevo Servidor</span>
                        </Link>
                    </div>

                    {/* ALERTAS FLASH */}
                    {flash?.success && (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/50 bg-emerald-950/40 px-5 py-4 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md">
                            <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
                            <span className="font-mono text-xs sm:text-sm font-semibold">{flash.success}</span>
                        </div>
                    )}

                    {flash?.warning && (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-500/50 bg-amber-950/40 px-5 py-4 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-md animate-pulse">
                            <AlertTriangle size={22} className="shrink-0 text-amber-400 mt-0.5" />
                            <div className="font-mono text-xs sm:text-sm">
                                <span className="font-bold text-amber-300">AVISO DE SERVICIO DETENIDO: </span>
                                {flash.warning}
                            </div>
                        </div>
                    )}

                    {/* METRICAS TELEMETRICAS */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono">
                        <div className="relative overflow-hidden rounded-xl border border-[#00f7ff]/40 bg-[#060a17]/80 p-5 shadow-[0_0_15px_rgba(0,247,255,0.15)] backdrop-blur-sm">
                            <div className="flex items-center justify-between text-slate-400 text-xs">
                                <span>SERVICIOS ACTIVOS</span>
                                <Server size={16} className="text-[#00f7ff]" />
                            </div>
                            <div className="mt-2 text-3xl font-black text-white">{active.length}</div>
                            <div className="mt-1 text-[11px] text-[#00f7ff]/80">Instancias en línea</div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-pink-500/40 bg-[#060a17]/80 p-5 shadow-[0_0_15px_rgba(255,0,128,0.15)] backdrop-blur-sm">
                            <div className="flex items-center justify-between text-slate-400 text-xs">
                                <span>FACTURAS PENDIENTES</span>
                                <Receipt size={16} className="text-pink-400" />
                            </div>
                            <div className="mt-2 text-3xl font-black text-white">{pendingInvoices.length}</div>
                            <div className="mt-1 text-[11px] text-pink-400/80">
                                {pendingInvoices.length > 0 ? 'Requiere atención' : 'Todo al día'}
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-purple-500/40 bg-[#060a17]/80 p-5 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-sm">
                            <div className="flex items-center justify-between text-slate-400 text-xs">
                                <span>PRÓXIMA RENOVACIÓN</span>
                                <Calendar size={16} className="text-purple-400" />
                            </div>
                            <div className="mt-2 text-2xl font-black text-white truncate">
                                {active.length ? fmtDate(active.map((o) => o.renews_at).sort()[0]) : '—'}
                            </div>
                            <div className="mt-1 text-[11px] text-purple-400/80">Ciclo mensual</div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-[#060a17]/80 p-5 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-sm">
                            <div className="flex items-center justify-between text-slate-400 text-xs">
                                <span>DAEMON WINGS</span>
                                <Activity size={16} className="text-emerald-400" />
                            </div>
                            <div className="mt-2 text-2xl font-black text-emerald-300">100% ONLINE</div>
                            <div className="mt-1 text-[11px] text-emerald-400/80">Latencia &lt; 1ms · Cluster OK</div>
                        </div>
                    </div>

                    {/* LISTADO DE SERVICIOS */}
                    <div className="overflow-hidden rounded-2xl border border-pink-500/30 bg-[#060a16]/85 shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-pink-500/20 px-6 py-4 bg-[#080d1e]/80">
                            <div className="flex items-center gap-2">
                                <Server size={18} className="text-pink-400" />
                                <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                                    Flota de Instancias Contratadas
                                </h2>
                            </div>
                            <span className="font-mono text-xs text-slate-400">
                                Total: {orders.length} servicios registrados
                            </span>
                        </div>

                        {orders.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <Server size={44} className="mx-auto text-pink-500/40 mb-3" />
                                <h3 className="font-mono text-base font-bold text-white">Aún no tienes servicios activos</h3>
                                <p className="mt-1 font-sans text-xs text-slate-400 max-w-sm mx-auto">
                                    Despliega tu servidor de Minecraft, bots de Discord o bases de datos en segundos.
                                </p>
                                <Link
                                    href={route('store')}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-pink-500 bg-pink-500/20 px-4 py-2 font-mono text-xs font-bold text-pink-300 transition hover:bg-pink-500 hover:text-white"
                                >
                                    <Plus size={14} />
                                    <span>Explorar Tienda de Planes</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-pink-500/10">
                                {orders.map((o) => {
                                    const isCancelled = o.status === 'cancelled';
                                    const isPending = o.status === 'pending';
                                    const isActive = o.status === 'active';

                                    return (
                                        <div 
                                            key={o.id} 
                                            className={`p-5 md:p-6 transition hover:bg-pink-500/[0.03] ${
                                                isCancelled ? 'bg-rose-950/15' : ''
                                            }`}
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                {/* Detalle Servidor */}
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        <h3 className="font-mono text-base font-bold text-white tracking-wide">
                                                            {o.server_name}
                                                        </h3>
                                                        <StatusBadge status={o.status} />
                                                        <span className="rounded bg-neutral-900 border border-neutral-700 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                                                            REF: #{o.id}
                                                        </span>
                                                    </div>

                                                    {/* IP y dirección */}
                                                    {o.server_address ? (
                                                        <div className="flex items-center gap-2 font-mono text-xs text-[#00f7ff]">
                                                            <span>IP: {o.server_address}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyIp(o.server_address)}
                                                                className="rounded border border-cyan-800 bg-cyan-950/50 p-1 text-cyan-300 transition hover:bg-cyan-800 hover:text-white"
                                                                title="Copiar IP de conexión"
                                                            >
                                                                {copiedIp === o.server_address ? <Check size={12} /> : <Copy size={12} />}
                                                            </button>
                                                            {copiedIp === o.server_address && (
                                                                <span className="text-[10px] text-emerald-400 font-bold">¡Copiado!</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="font-mono text-xs text-slate-500">
                                                            {isPending ? '⏳ Asignando IP al confirmar pago...' : 'IP no disponible'}
                                                        </div>
                                                    )}

                                                    {/* Specs Hardware */}
                                                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-300">
                                                        <span className="rounded-md border border-neutral-800 bg-[#090d1f] px-2.5 py-1">
                                                            🎮 Plan: <span className="text-pink-300 font-semibold">{o.plan?.name || 'Personalizado'}</span>
                                                        </span>
                                                        {o.plan && (
                                                            <>
                                                                <span className="rounded-md border border-neutral-800 bg-[#090d1f] px-2.5 py-1">
                                                                    ⚡ {fmtRam(o.plan.ram_mb)} RAM
                                                                </span>
                                                                <span className="rounded-md border border-neutral-800 bg-[#090d1f] px-2.5 py-1">
                                                                    <Cpu size={11} className="inline mr-1 text-[#00f7ff]" />
                                                                    {o.plan.cpu_pct}% CPU
                                                                </span>
                                                                <span className="rounded-md border border-neutral-800 bg-[#090d1f] px-2.5 py-1">
                                                                    <HardDrive size={11} className="inline mr-1 text-pink-400" />
                                                                    {o.plan.storage_gb} GB NVMe
                                                                </span>
                                                            </>
                                                        )}
                                                        <span className="rounded-md border border-neutral-800 bg-[#090d1f] px-2.5 py-1 text-white font-bold">
                                                            {fmtPrice(o.price)} €/{cycleUnit(billingCycles, o.billing_cycle)}
                                                        </span>
                                                    </div>

                                                    {/* Aviso si está cancelado */}
                                                    {isCancelled && (
                                                        <div className="mt-2 flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 font-mono text-xs text-rose-300">
                                                            <ShieldAlert size={15} className="text-rose-400 shrink-0" />
                                                            <span>
                                                                ⚠️ Servidor detenido de inmediato. Programado para eliminación permanente en 7 días.
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Acciones */}
                                                <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                                                    {isActive && (
                                                        <a
                                                            href={o.panel_server_id ? `${panelUrl}/servers/${o.panel_server_id}/console` : `${panelUrl}/servers`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 rounded-xl border border-[#00f7ff]/60 bg-gradient-to-r from-[#00f7ff]/15 to-cyan-600/20 px-4 py-2 font-bold text-[#00f7ff] shadow-[0_0_15px_rgba(0,247,255,0.2)] transition hover:border-[#00f7ff] hover:bg-[#00f7ff] hover:text-[#04060d] hover:shadow-[0_0_20px_rgba(0,247,255,0.4)]"
                                                        >
                                                            <Terminal size={14} />
                                                            <span>Gestionar Consola</span>
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}

                                                    {isPending && (
                                                        <span className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-amber-300 font-semibold">
                                                            Esperando Confirmación de Pago
                                                        </span>
                                                    )}

                                                    {(isActive || isPending) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setCancelModalOrder(o)}
                                                            className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-2 font-semibold text-rose-300 transition hover:border-rose-500 hover:bg-rose-900/60 hover:text-white"
                                                        >
                                                            <Trash2 size={13} />
                                                            <span>Cancelar Servicio</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* FACTURAS */}
                    <div className="overflow-hidden rounded-2xl border border-pink-500/30 bg-[#060a16]/85 shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
                        <div className="flex items-center justify-between border-b border-pink-500/20 px-6 py-4 bg-[#080d1e]/80">
                            <div className="flex items-center gap-2">
                                <Receipt size={18} className="text-[#00f7ff]" />
                                <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                                    Historial de Facturación & Invoices
                                </h2>
                            </div>
                            <span className="font-mono text-xs text-slate-400">
                                {invoices.length} facturas emitidas
                            </span>
                        </div>

                        {invoices.length === 0 ? (
                            <p className="px-6 py-10 font-mono text-xs text-slate-500 text-center">
                                No hay facturas registradas en tu cuenta.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono text-xs">
                                    <thead className="border-b border-pink-500/20 bg-black/40 text-[10px] uppercase tracking-wider text-slate-400">
                                        <tr>
                                            <th className="px-6 py-3">Factura</th>
                                            <th className="px-6 py-3">Servicio Vinculado</th>
                                            <th className="px-6 py-3">Importe</th>
                                            <th className="px-6 py-3">Vencimiento</th>
                                            <th className="px-6 py-3">Estado</th>
                                            <th className="px-6 py-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-pink-500/10">
                                        {invoices.map((inv) => (
                                            <tr key={inv.id} className="transition hover:bg-pink-500/[0.04]">
                                                <td className="px-6 py-4 font-bold text-white">
                                                    {inv.number}
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">
                                                    {inv.order?.server_name ?? `Pedido #${inv.order_id}`}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-[#00f7ff]">
                                                    {fmtPrice(inv.amount)} €
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">
                                                    {fmtDate(inv.due_at)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={inv.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {inv.status !== 'paid' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => payInvoice(inv)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#00f7ff]/50 bg-[#00f7ff]/15 px-3 py-1.5 text-xs font-bold text-[#00f7ff] shadow-[0_0_12px_rgba(0,247,255,0.2)] transition hover:bg-[#00f7ff] hover:text-black"
                                                        >
                                                            <CreditCard size={13} />
                                                            <span>Pagar Factura</span>
                                                        </button>
                                                    ) : (
                                                        <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                                                            ✓ Pagada
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN DE CANCELACIÓN CON AVISO DE DETENCIÓN Y ELIMINACIÓN */}
            <Modal show={cancelModalOrder !== null} onClose={() => setCancelModalOrder(null)} maxWidth="md">
                {cancelModalOrder && (
                    <div className="bg-[#090e1f] border border-rose-500/50 rounded-2xl p-6 font-mono text-white shadow-[0_0_40px_rgba(225,29,72,0.35)]">
                        <div className="flex items-center gap-3 text-rose-400 border-b border-rose-500/30 pb-4">
                            <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-2.5">
                                <AlertTriangle size={24} className="text-rose-400 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold tracking-wide text-white">
                                    CANCELAR SERVICIO
                                </h3>
                                <p className="text-xs text-rose-300">
                                    {cancelModalOrder.server_name}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
                            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 space-y-2">
                                <p className="font-bold text-rose-300 flex items-center gap-1.5">
                                    <span>🛑 Detención Inmediata:</span>
                                </p>
                                <p className="text-slate-300 text-[12px]">
                                    El servidor en Wings se <strong>detendrá de inmediato</strong> y dejará de aceptar conexiones.
                                </p>
                            </div>

                            <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3.5 space-y-2">
                                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                                    <span>⏳ Aviso de Eliminación Programada:</span>
                                </p>
                                <p className="text-slate-300 text-[12px]">
                                    Dispones de un <strong>periodo de gracia de 7 días</strong> para descargar tus copias de seguridad antes de que los archivos, base de datos y volumen sean <strong>eliminados permanentemente</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-neutral-800">
                            <button
                                type="button"
                                onClick={() => setCancelModalOrder(null)}
                                className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 font-mono text-xs font-semibold text-slate-300 transition hover:bg-neutral-800"
                            >
                                Conservar Servidor
                            </button>
                            <button
                                type="button"
                                onClick={confirmCancel}
                                className="flex items-center justify-center gap-2 rounded-xl border border-rose-500 bg-gradient-to-r from-rose-600 to-red-700 px-5 py-2.5 font-mono text-xs font-bold text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] transition hover:brightness-110 active:scale-95"
                            >
                                <Trash2 size={14} />
                                <span>Confirmar Cancelación y Detener</span>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
