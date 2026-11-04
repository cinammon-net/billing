import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Banknote, Bitcoin, Check, Copy, Lock, Smartphone, Wallet } from 'lucide-react';
import { useState } from 'react';

const META = {
    transfer: { title: 'Transferencia bancaria', icon: Banknote, help: 'El cliente ve tu IBAN y usa el número de factura como concepto. Tú confirmas el ingreso en Admin → Pagos.' },
    bizum: { title: 'Bizum', icon: Smartphone, help: 'El cliente envía el Bizum a este teléfono con el número de factura como concepto. Tú confirmas en Admin → Pagos.' },
    crypto: {
        title: 'Criptomonedas (NOWPayments)',
        icon: Bitcoin,
        help: 'Crea una cuenta en nowpayments.io y añade tu cartera. En Settings → Payments genera la API key y el IPN secret, y pega la URL de notificaciones de abajo. Se activa solo al confirmarse el pago.',
    },
    paypal: {
        title: 'PayPal',
        icon: Wallet,
        help: 'Necesitas una cuenta PayPal Business. En developer.paypal.com → Apps & Credentials crea una app (Live) y copia el Client ID y el Secret. Se activa al volver del pago.',
    },
};

function CopyBox({ label, value }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-black/50 px-3 py-2 font-mono text-[11px]">
            <span className="text-slate-400">{label}</span>
            <span className="min-w-0 flex-1 break-all text-[#00f7ff]">{value}</span>
            <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
                className="inline-flex items-center gap-1 rounded border border-slate-700 px-1.5 py-0.5 text-slate-300 hover:border-[#00f7ff]"
            >
                {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copiado' : 'Copiar'}
            </button>
        </div>
    );
}

function MethodCard({ method, webhookUrl }) {
    const meta = META[method.key];
    const Icon = meta.icon;
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({ enabled: method.enabled, values: { ...method.values } });

    const save = (e) => {
        e.preventDefault();
        put(route('admin.payment-methods.update', method.key), { preserveScroll: true });
    };

    return (
        <form onSubmit={save} className={`rounded-2xl border p-5 ${data.enabled ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800 bg-[#070b18]/90'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-black text-white">
                    <Icon size={18} className="text-[#00f7ff]" /> {meta.title}
                </h2>
                <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-slate-300">
                    <input type="checkbox" checked={data.enabled} onChange={(e) => setData('enabled', e.target.checked)} className="peer sr-only" />
                    <span className={`relative h-5 w-9 rounded-full transition ${data.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${data.enabled ? 'left-4' : 'left-0.5'}`} />
                    </span>
                    {data.enabled ? 'Activado' : 'Desactivado'}
                </label>
            </div>
            <p className="mt-2 text-xs text-slate-400">{meta.help}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {method.fields.map((f) =>
                    f.boolean ? (
                        <label key={f.key} className="flex items-center gap-2 text-xs text-slate-300 sm:col-span-2">
                            <input type="checkbox" checked={!!data.values[f.key]} onChange={(e) => setData('values', { ...data.values, [f.key]: e.target.checked })} />
                            {f.label} <span className="text-slate-500">(para probar sin dinero real)</span>
                        </label>
                    ) : (
                        <label key={f.key} className="space-y-1">
                            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                                {f.secret && <Lock size={11} className="text-amber-400" />}
                                {f.label}
                                {f.required && <span className="text-pink-400">*</span>}
                            </span>
                            <input
                                type={f.secret ? 'password' : 'text'}
                                autoComplete="off"
                                value={data.values[f.key] ?? ''}
                                onChange={(e) => setData('values', { ...data.values, [f.key]: e.target.value })}
                                placeholder={f.secret && f.set ? '•••••••• guardado (déjalo vacío para conservarlo)' : ''}
                                className="w-full rounded-lg border border-slate-700 bg-black/50 px-3 py-2 font-mono text-sm text-white placeholder-slate-500 focus:border-[#00f7ff] focus:outline-none"
                            />
                            <InputError message={errors[`values.${f.key}`]} />
                        </label>
                    ),
                )}
            </div>

            {method.key === 'crypto' && (
                <div className="mt-4">
                    <CopyBox label="URL de notificaciones (IPN):" value={webhookUrl} />
                </div>
            )}

            <InputError message={errors.values} className="mt-3" />
            <div className="mt-4 flex items-center gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg border border-[#00f7ff]/60 bg-[#00f7ff]/15 px-4 py-2 text-xs font-bold text-[#00f7ff] transition hover:bg-[#00f7ff] hover:text-black disabled:opacity-50"
                >
                    Guardar
                </button>
                {recentlySuccessful && <span className="font-mono text-xs text-emerald-400">✓ Guardado</span>}
                {!method.complete && !data.enabled && <span className="font-mono text-[11px] text-slate-500">Sin configurar</span>}
            </div>
        </form>
    );
}

export default function PaymentSettings({ methods, webhookUrl }) {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Métodos de pago" />
            <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
                <div>
                    <h1 className="text-2xl font-black text-white">Métodos de pago</h1>
                    <p className="mt-1 text-xs text-slate-400">
                        Activa los métodos que quieras ofrecer. Solo los activados y completos aparecen al pagar. Los datos se guardan cifrados y las claves
                        secretas nunca se vuelven a mostrar.
                    </p>
                </div>
                {methods.map((m) => (
                    <MethodCard key={m.key} method={m} webhookUrl={webhookUrl} />
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
