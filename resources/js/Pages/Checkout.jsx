import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { fmtPrice } from '@/lib/price';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Banknote, Bitcoin, Check, Clock, Copy, FlaskConical, Smartphone, Wallet } from 'lucide-react';
import { useState } from 'react';

const ICONS = { transfer: Banknote, bizum: Smartphone, crypto: Bitcoin, paypal: Wallet };
const HINTS = {
    transfer: 'Sin comisiones. Se activa cuando confirmamos el ingreso (normalmente en horas).',
    bizum: 'Sin comisiones. Se activa cuando confirmamos el Bizum.',
    crypto: 'BTC, ETH, USDT, LTC y más de 100 monedas. Se activa automáticamente al confirmarse.',
    paypal: 'Con tu saldo de PayPal. Se activa al instante.',
};

function CopyValue({ value }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={() => {
                navigator.clipboard?.writeText(value).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                });
            }}
            className="inline-flex items-center gap-1 rounded border border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300 hover:border-[#00f7ff] hover:text-[#00f7ff]"
            aria-label={`Copiar ${value}`}
        >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copiado' : 'Copiar'}
        </button>
    );
}

export default function Checkout({ invoice, methods, currency, canSimulate, returnStatus }) {
    const { auth, errors: pageErrors } = usePage().props;
    const [method, setMethod] = useState(methods[0]?.key ?? null);
    const current = methods.find((m) => m.key === method);
    const { data, setData, post, processing, errors } = useForm({ method: method ?? '', payer_note: '' });
    const [redirecting, setRedirecting] = useState(false);

    const choose = (key) => {
        setMethod(key);
        setData('method', key);
    };

    const goGateway = (key) => {
        setRedirecting(true);
        router.post(route(key === 'crypto' ? 'checkout.crypto' : 'checkout.paypal', invoice.id), {}, { onFinish: () => setRedirecting(false) });
    };

    const submitManual = (e) => {
        e.preventDefault();
        post(route('checkout.manual', invoice.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Pagar ${invoice.number}`} />
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
                <Link href={route('dashboard')} className="inline-flex items-center gap-2 font-mono text-xs text-pink-400 hover:text-[#00f7ff]">
                    <ArrowLeft size={14} /> Volver a mis servicios
                </Link>

                <div className="rounded-2xl border border-slate-800 bg-[#070b18]/90 p-6">
                    <p className="font-mono text-[10px] font-bold tracking-widest text-slate-500 uppercase">// Factura {invoice.number}</p>
                    <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-black text-white">{invoice.concept ?? invoice.plan}</h1>
                            {invoice.plan && invoice.concept !== invoice.plan && <p className="text-xs text-slate-400">Plan {invoice.plan}</p>}
                        </div>
                        <p className="font-mono text-3xl font-black text-[#00f7ff]">
                            {fmtPrice(invoice.amount)} {currency === 'EUR' ? '€' : currency}
                        </p>
                    </div>

                    {invoice.status === 'awaiting' && (
                        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
                            <Clock size={14} className="mt-0.5 shrink-0" />
                            <span>
                                Ya nos avisaste de un pago por {invoice.payment_method === 'bizum' ? 'Bizum' : 'transferencia'} («{invoice.payer_note}»). Lo estamos
                                comprobando; no hace falta que hagas nada más.
                            </span>
                        </div>
                    )}
                    {invoice.admin_note && invoice.status === 'pending' && (
                        <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                            No pudimos confirmar tu pago anterior: {invoice.admin_note}
                        </div>
                    )}
                    {returnStatus === 'cancelled' && (
                        <div className="mt-4 rounded-lg border border-slate-600 bg-slate-800/40 p-3 text-xs text-slate-300">Pago cancelado. No se te ha cobrado nada.</div>
                    )}
                    {returnStatus === 'success' && (
                        <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                            Pago enviado. Lo activaremos en cuanto la red lo confirme (suele tardar unos minutos).
                        </div>
                    )}
                    <InputError message={pageErrors?.payment} className="mt-3" />
                </div>

                {methods.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-[#070b18]/90 p-6 text-sm text-slate-300">
                        Todavía no hay métodos de pago disponibles. Contacta con soporte para completar tu pedido.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Método de pago">
                            {methods.map((m) => {
                                const Icon = ICONS[m.key] ?? Wallet;
                                const on = m.key === method;
                                return (
                                    <button
                                        key={m.key}
                                        type="button"
                                        role="radio"
                                        aria-checked={on}
                                        onClick={() => choose(m.key)}
                                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-bold transition ${
                                            on
                                                ? 'border-[#00f7ff] bg-[#00f7ff]/10 text-[#00f7ff] shadow-[0_0_14px_rgba(0,247,255,0.25)]'
                                                : 'border-slate-800 bg-black/40 text-slate-300 hover:border-pink-500/60'
                                        }`}
                                    >
                                        <Icon size={22} />
                                        {m.label}
                                    </button>
                                );
                            })}
                        </div>

                        {current && (
                            <div className="rounded-2xl border border-slate-800 bg-[#070b18]/90 p-6">
                                <p className="text-xs text-slate-400">{HINTS[current.key]}</p>

                                {!current.auto ? (
                                    <form onSubmit={submitManual} className="mt-4 space-y-4">
                                        <dl className="divide-y divide-slate-800 rounded-lg border border-slate-800 font-mono text-sm">
                                            {Object.entries(current.details).map(([k, v]) => (
                                                <div key={k} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                                                    <dt className="text-slate-400">{k}</dt>
                                                    <dd className="flex items-center gap-2 font-bold text-white">
                                                        {v} <CopyValue value={v} />
                                                    </dd>
                                                </div>
                                            ))}
                                            <div className="flex flex-wrap items-center justify-between gap-2 bg-pink-500/10 px-4 py-2.5">
                                                <dt className="text-pink-300">Concepto (obligatorio)</dt>
                                                <dd className="flex items-center gap-2 font-bold text-pink-200">
                                                    {invoice.number} <CopyValue value={invoice.number} />
                                                </dd>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                                                <dt className="text-slate-400">Importe exacto</dt>
                                                <dd className="font-bold text-white">{fmtPrice(invoice.amount)} €</dd>
                                            </div>
                                        </dl>

                                        <label className="block space-y-1">
                                            <span className="font-mono text-xs text-slate-300">
                                                Cuando hayas pagado, indica {current.key === 'bizum' ? 'el teléfono desde el que enviaste el Bizum' : 'el nombre del titular que hizo la transferencia'}:
                                            </span>
                                            <input
                                                value={data.payer_note}
                                                onChange={(e) => setData('payer_note', e.target.value)}
                                                maxLength={255}
                                                required
                                                className="w-full rounded-lg border border-slate-700 bg-black/50 px-3 py-2 text-sm text-white focus:border-[#00f7ff] focus:outline-none"
                                                placeholder={current.key === 'bizum' ? '6XX XXX XXX' : 'Nombre y apellidos'}
                                            />
                                            <InputError message={errors.payer_note} />
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full rounded-lg border border-[#00f7ff]/60 bg-[#00f7ff]/15 py-2.5 text-sm font-bold text-[#00f7ff] transition hover:bg-[#00f7ff] hover:text-black disabled:opacity-50"
                                        >
                                            Ya he pagado
                                        </button>
                                    </form>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => goGateway(current.key)}
                                        disabled={redirecting}
                                        className="mt-4 w-full rounded-lg border border-[#00f7ff]/60 bg-[#00f7ff]/15 py-2.5 text-sm font-bold text-[#00f7ff] transition hover:bg-[#00f7ff] hover:text-black disabled:opacity-50"
                                    >
                                        {redirecting ? 'Redirigiendo…' : `Pagar ${fmtPrice(invoice.amount)} € con ${current.label}`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {canSimulate && (
                    <button
                        type="button"
                        onClick={() => confirm('¿Activar este pedido SIN cobrar (pago simulado de admin)?') && router.post(route('checkout.simulate', invoice.id))}
                        className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-3 py-2 font-mono text-xs text-yellow-300 hover:bg-yellow-500/20"
                    >
                        <FlaskConical size={14} /> Pago simulado (solo admins)
                    </button>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
