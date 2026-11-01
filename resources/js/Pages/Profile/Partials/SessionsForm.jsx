import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';

export default function SessionsForm({ className = '' }) {
    const { sessions } = usePage().props;

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.logout-other-sessions'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-pink-400">Sesiones activas</h2>
                <p className="mt-1 text-sm text-pink-200">
                    Dispositivos con sesión abierta en tu cuenta. Cierra las que no reconozcas.
                </p>
            </header>

            <div className="mt-6 space-y-3">
                {(sessions ?? []).map((session) => (
                    <div
                        key={session.id}
                        className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm ${
                            session.is_current ? 'border-[#00f7ff]/50 bg-[#00f7ff]/5' : 'border-pink-500/30 bg-black/40'
                        }`}
                    >
                        <div>
                            <p className="font-semibold text-white">{session.user_agent}</p>
                            <p className="mt-0.5 text-xs text-gray-400">
                                {session.ip_address ?? 'IP desconocida'} · Última actividad: {session.last_activity}
                            </p>
                        </div>
                        {session.is_current && (
                            <span className="rounded-full border border-[#00f7ff]/50 px-3 py-0.5 text-xs font-semibold text-[#00f7ff]">
                                Este dispositivo
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <InputLabel htmlFor="sessions_password" value="Contraseña actual" />
                    <TextInput
                        id="sessions_password"
                        type="password"
                        className="mt-1 block w-full"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="current-password"
                        placeholder="Contraseña"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Cerrar otras sesiones</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-[#00f7ff]">Sesiones cerradas.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
