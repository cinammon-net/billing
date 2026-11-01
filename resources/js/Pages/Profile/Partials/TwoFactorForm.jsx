import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

export default function TwoFactorForm({ twoFactor, className = '' }) {
    const canvasRef = useRef(null);

    const enableForm = useForm({});
    const confirmForm = useForm({ code: '' });
    const disableForm = useForm({ password: '' });

    useEffect(() => {
        if (twoFactor?.otpauthUrl && canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, twoFactor.otpauthUrl, {
                width: 200,
                margin: 1,
                color: { dark: '#ffffff', light: '#00000000' },
            });
        }
    }, [twoFactor?.otpauthUrl]);

    const enable = (e) => {
        e.preventDefault();
        enableForm.post(route('two-factor.enable'), { preserveScroll: true });
    };

    const confirm = (e) => {
        e.preventDefault();
        confirmForm.post(route('two-factor.confirm'), {
            preserveScroll: true,
            onSuccess: () => confirmForm.reset(),
        });
    };

    const disable = (e) => {
        e.preventDefault();
        disableForm.delete(route('two-factor.disable'), {
            preserveScroll: true,
            onSuccess: () => disableForm.reset(),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-pink-400">Autenticación en dos pasos (2FA)</h2>
                <p className="mt-1 text-sm text-pink-200">
                    Protege tu cuenta con un código temporal de tu app de autenticación (Google Authenticator, Authy…).
                </p>
            </header>

            {/* ESTADO: DESACTIVADO */}
            {!twoFactor?.enabled && !twoFactor?.pendingSecret && (
                <form onSubmit={enable} className="mt-6">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                        ● Desactivado
                    </div>
                    <div>
                        <PrimaryButton disabled={enableForm.processing}>Activar 2FA</PrimaryButton>
                    </div>
                </form>
            )}

            {/* ESTADO: PENDIENTE DE CONFIRMAR */}
            {!twoFactor?.enabled && twoFactor?.pendingSecret && (
                <div className="mt-6 space-y-4">
                    <p className="text-sm text-gray-300">
                        1. Escanea este código QR con tu app de autenticación (o introduce el secreto manualmente).
                    </p>
                    <div className="inline-block rounded-xl border border-pink-500/40 bg-black/80 p-4">
                        <canvas ref={canvasRef} />
                    </div>
                    <p className="font-mono text-xs break-all text-[#00f7ff]">{twoFactor.pendingSecret}</p>

                    <form onSubmit={confirm} className="space-y-3">
                        <p className="text-sm text-gray-300">2. Introduce el código de 6 dígitos para confirmar:</p>
                        <div className="flex items-start gap-3">
                            <div>
                                <TextInput
                                    id="two_factor_code"
                                    className="w-40 text-center font-mono tracking-[0.3em]"
                                    value={confirmForm.data.code}
                                    onChange={(e) => confirmForm.setData('code', e.target.value)}
                                    placeholder="000000"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                />
                                <InputError message={confirmForm.errors.code} className="mt-2" />
                            </div>
                            <PrimaryButton disabled={confirmForm.processing}>Confirmar</PrimaryButton>
                        </div>
                    </form>
                </div>
            )}

            {/* ESTADO: ACTIVADO */}
            {twoFactor?.enabled && (
                <div className="mt-6 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#00f7ff]/40 bg-[#00f7ff]/10 px-3 py-1 text-xs font-semibold text-[#00f7ff]">
                        ● Activado
                    </div>

                    {twoFactor.recoveryCodes && (
                        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/5 p-4">
                            <p className="text-sm font-semibold text-yellow-400">
                                Guarda estos códigos de recuperación en un lugar seguro. Solo se muestran una vez:
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-white sm:grid-cols-4">
                                {twoFactor.recoveryCodes.map((code) => (
                                    <span key={code}>{code}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={disable} className="space-y-3">
                        <div>
                            <InputLabel htmlFor="disable_2fa_password" value="Contraseña actual para desactivar" />
                            <TextInput
                                id="disable_2fa_password"
                                type="password"
                                className="mt-1 block w-full max-w-xs"
                                value={disableForm.data.password}
                                onChange={(e) => disableForm.setData('password', e.target.value)}
                                autoComplete="current-password"
                            />
                            <InputError message={disableForm.errors.password} className="mt-2" />
                        </div>
                        <DangerButton disabled={disableForm.processing}>Desactivar 2FA</DangerButton>
                    </form>
                </div>
            )}
        </section>
    );
}
