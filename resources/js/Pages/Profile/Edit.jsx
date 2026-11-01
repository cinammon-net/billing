import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BillingDetailsForm from './Partials/BillingDetailsForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import SessionsForm from './Partials/SessionsForm';
import TwoFactorForm from './Partials/TwoFactorForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head, Link } from '@inertiajs/react';

const Card = ({ children }) => (
    <div className="p-4 sm:p-8 rounded-xl border border-pink-500/40 bg-black/60 shadow-[0_0_20px_rgba(255,0,150,0.2)] backdrop-blur-sm sm:rounded-xl">
        {children}
    </div>
);

export default function Edit({ auth, mustVerifyEmail, status, billing, billingDetails, twoFactor, loginHistory }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-pink-400 leading-tight tracking-wide">Mi perfil</h2>}
        >
            <Head title="Mi perfil" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* RESUMEN DE CUENTA */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 px-4 sm:px-0">
                        {[
                            { label: 'Servicios activos', value: billing?.activeServices ?? 0, accent: 'text-[#00f7ff]' },
                            { label: 'Facturas emitidas', value: billing?.invoices ?? 0, accent: 'text-pink-400' },
                            { label: 'Total gastado', value: `${(billing?.totalSpent ?? 0).toFixed(2)} €`, accent: 'text-fuchsia-400' },
                            { label: 'Cliente desde', value: billing?.memberSince ?? '—', accent: 'text-white' },
                        ].map((card) => (
                            <div
                                key={card.label}
                                className="rounded-xl border border-pink-500/40 bg-black/60 p-4 shadow-[0_0_15px_rgba(255,0,150,0.15)] backdrop-blur-sm"
                            >
                                <p className="text-xs text-gray-400">{card.label}</p>
                                <p className={`mt-1 text-xl font-bold tracking-wide ${card.accent}`}>{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* INFORMACIÓN DEL PERFIL */}
                    <Card>
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="max-w-xl" />
                    </Card>

                    {/* SEGURIDAD: CONTRASEÑA */}
                    <Card>
                        <UpdatePasswordForm className="max-w-xl" />
                    </Card>

                    {/* SEGURIDAD: 2FA */}
                    <Card>
                        <TwoFactorForm twoFactor={twoFactor} className="max-w-2xl" />
                    </Card>

                    {/* SEGURIDAD: SESIONES */}
                    <Card>
                        <SessionsForm className="max-w-2xl" />
                    </Card>

                    {/* SEGURIDAD: HISTORIAL DE ACCESOS */}
                    <Card>
                        <section className="max-w-2xl">
                            <header>
                                <h2 className="text-lg font-medium text-pink-400">Historial de accesos</h2>
                                <p className="mt-1 text-sm text-pink-200">Últimos inicios de sesión en tu cuenta.</p>
                            </header>
                            {(loginHistory ?? []).length === 0 ? (
                                <p className="mt-4 text-sm text-gray-400">Todavía no hay accesos registrados.</p>
                            ) : (
                                <ul className="mt-4 space-y-2">
                                    {loginHistory.map((log) => (
                                        <li
                                            key={log.id}
                                            className="flex items-center justify-between rounded-md border border-pink-500/20 bg-black/40 px-4 py-2 text-sm"
                                        >
                                            <span className="text-white">{log.user_agent}</span>
                                            <span className="text-xs text-gray-400">
                                                {log.ip_address ?? 'IP desconocida'} · {log.created_at}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </Card>

                    {/* DATOS DE FACTURACIÓN */}
                    <Card>
                        <BillingDetailsForm billingDetails={billingDetails} className="max-w-2xl" />
                    </Card>

                    {/* FACTURACIÓN */}
                    <Card>
                        <section className="max-w-2xl">
                            <header>
                                <h2 className="text-lg font-medium text-pink-400">Facturación</h2>
                                <p className="mt-1 text-sm text-pink-200">
                                    Consulta tus servicios contratados y el historial de facturas.
                                </p>
                            </header>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-md bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-pink-600 hover:to-fuchsia-700"
                                >
                                    Mis servicios y facturas
                                </Link>
                                <Link
                                    href={route('store')}
                                    className="rounded-md border border-pink-400 px-4 py-2 text-sm font-semibold text-pink-300 transition hover:bg-pink-400 hover:text-black"
                                >
                                    Contratar nuevo servicio
                                </Link>
                            </div>
                        </section>
                    </Card>

                    {/* ZONA PELIGROSA */}
                    <Card>
                        <DeleteUserForm className="max-w-xl" />
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
