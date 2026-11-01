import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.login'));
    };

    return (
        <GuestLayout>
            <Head title="Verificación en dos pasos" />

            <p className="mb-4 text-sm text-pink-200">
                Introduce el código de 6 dígitos de tu app de autenticación, o uno de tus códigos de recuperación.
            </p>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="code" value="Código" />
                    <TextInput
                        id="code"
                        className="mt-1 block w-full text-center font-mono tracking-[0.3em]"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value)}
                        placeholder="000000"
                        isFocused
                        autoComplete="one-time-code"
                    />
                    <InputError message={errors.code} className="mt-2" />
                </div>

                <div className="flex justify-end">
                    <PrimaryButton disabled={processing}>Verificar</PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
