import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';

export default function BillingDetailsForm({ billingDetails, className = '' }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        company: billingDetails?.company ?? '',
        tax_id: billingDetails?.tax_id ?? '',
        address: billingDetails?.address ?? '',
        city: billingDetails?.city ?? '',
        postal_code: billingDetails?.postal_code ?? '',
        country: billingDetails?.country ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.billing-details'), { preserveScroll: true });
    };

    const fields = [
        { key: 'company', label: 'Empresa (opcional)', placeholder: 'Mi Empresa S.L.' },
        { key: 'tax_id', label: 'NIF / CIF', placeholder: 'B12345678' },
        { key: 'address', label: 'Dirección', placeholder: 'Calle Mayor 1, 2ºA' },
        { key: 'city', label: 'Ciudad', placeholder: 'Madrid' },
        { key: 'postal_code', label: 'Código postal', placeholder: '28001' },
        { key: 'country', label: 'País', placeholder: 'España' },
    ];

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-pink-400">Datos de facturación</h2>
                <p className="mt-1 text-sm text-pink-200">
                    Estos datos aparecerán en tus facturas.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                    <div key={f.key}>
                        <InputLabel htmlFor={`bd_${f.key}`} value={f.label} />
                        <TextInput
                            id={`bd_${f.key}`}
                            className="mt-1 block w-full"
                            value={data[f.key]}
                            onChange={(e) => setData(f.key, e.target.value)}
                            placeholder={f.placeholder}
                        />
                        <InputError message={errors[f.key]} className="mt-2" />
                    </div>
                ))}

                <div className="flex items-center gap-4 sm:col-span-2">
                    <PrimaryButton disabled={processing}>Guardar datos</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-neon">Guardado.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
