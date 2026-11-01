import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const fmtRam = (mb) => (mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`);

export default function StoreCategory({ category, plans }) {
    const { auth } = usePage().props;
    const [selected, setSelected] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({ plan_id: null, server_name: '' });

    const openOrder = (plan) => {
        setSelected(plan);
        setData({ plan_id: plan.id, server_name: '' });
    };

    const close = () => {
        setSelected(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('orders.store'), { onSuccess: close });
    };

    return (
        <PublicLayout>
            <Head title={category.title} />

            <section className="px-6 py-16 text-center">
                <h1 className="text-3xl font-extrabold tracking-widest text-pink-400 sm:text-4xl">{category.title}</h1>
                <p className="mt-3 text-pink-300">{category.tagline}</p>

                <div className="mx-auto mt-12 grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-xl border bg-black/60 p-6 text-left backdrop-blur-sm transition ${
                                plan.popular
                                    ? 'border-[#00f7ff] shadow-[0_0_25px_rgba(0,247,255,0.3)]'
                                    : 'border-pink-500/40 shadow-[0_0_15px_rgba(255,0,150,0.15)] hover:border-pink-500'
                            }`}
                        >
                            {plan.popular && (
                                <span className="absolute -top-3 right-4 rounded-full bg-[#00f7ff] px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-black">
                                    Popular
                                </span>
                            )}
                            <h2 className="text-lg font-bold tracking-wide text-pink-400">{plan.name}</h2>
                            <p className="mt-2 text-3xl font-extrabold text-white">
                                {plan.price.toFixed(2)} €<span className="text-sm font-normal text-gray-400">/mes</span>
                            </p>
                            <ul className="mt-4 space-y-2 text-sm text-gray-300">
                                <li><span className="text-[#00f7ff]">▸</span> {fmtRam(plan.ram_mb)} RAM DDR5</li>
                                <li><span className="text-[#00f7ff]">▸</span> {plan.cpu_pct}% CPU Ryzen</li>
                                <li><span className="text-[#00f7ff]">▸</span> {plan.storage_gb} GB NVMe SSD</li>
                                {(plan.features || []).map((f) => (
                                    <li key={f}><span className="text-pink-400">▸</span> {f}</li>
                                ))}
                            </ul>
                            <div className="mt-6 flex-1" />
                            <PrimaryButton className="w-full" onClick={() => openOrder(plan)}>
                                Contratar
                            </PrimaryButton>
                        </div>
                    ))}
                </div>
            </section>

            {/* MODAL DE PEDIDO */}
            <Modal show={selected !== null} onClose={close} maxWidth="md">
                {selected && (
                    <div className="p-6">
                        <h2 className="text-lg font-bold tracking-wide text-pink-400">
                            Contratar {category.title} — {selected.name}
                        </h2>
                        <p className="mt-1 text-sm text-gray-300">
                            {fmtRam(selected.ram_mb)} RAM · {selected.storage_gb} GB NVMe ·{' '}
                            <span className="font-semibold text-[#00f7ff]">{selected.price.toFixed(2)} €/mes</span>
                        </p>

                        {auth?.user ? (
                            <form onSubmit={submit} className="mt-6 space-y-4">
                                <div>
                                    <InputLabel htmlFor="server_name" value="Nombre del servidor" />
                                    <TextInput
                                        id="server_name"
                                        className="mt-1 block w-full"
                                        value={data.server_name}
                                        onChange={(e) => setData('server_name', e.target.value)}
                                        placeholder="Mi servidor épico"
                                        isFocused
                                    />
                                    <InputError message={errors.server_name} className="mt-2" />
                                    <InputError message={errors.plan_id} className="mt-2" />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <SecondaryButton onClick={close}>Cancelar</SecondaryButton>
                                    <PrimaryButton disabled={processing}>Confirmar pedido</PrimaryButton>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-6 space-y-4">
                                <p className="text-sm text-pink-200">Necesitas una cuenta para contratar este plan.</p>
                                <div className="flex justify-end gap-3">
                                    <Link href={route('register')}>
                                        <SecondaryButton>Registrarse</SecondaryButton>
                                    </Link>
                                    <Link href={route('login')}>
                                        <PrimaryButton>Iniciar sesión</PrimaryButton>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </PublicLayout>
    );
}
