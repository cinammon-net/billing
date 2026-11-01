import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { panelUrl } = usePage().props;

    return (
        <div className="relative min-h-screen bg-black font-sans text-white">
            <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-[length:22px_22px] opacity-10" />
            <nav className="relative z-10 border-b border-pink-600 bg-black/70 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <a href={panelUrl} title="Volver a cinammon.net">
                                    <ApplicationLogo className="block h-9 w-auto transition hover:opacity-80" />
                                </a>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Mis servicios
                                </NavLink>
                                <NavLink href={route('store')} active={route().current('store') || route().current('store.category')}>
                                    Tienda
                                </NavLink>
                                <a
                                    href={panelUrl}
                                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium leading-5 text-[#00f7ff] transition duration-150 ease-in-out hover:border-[#00f7ff]/50 focus:outline-none"
                                >
                                    Web principal ↗
                                </a>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-pink-600/30 text-sm leading-4 font-medium rounded-md text-pink-300 bg-black/80 hover:text-pink-200 hover:border-pink-500 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {user.name}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 focus:outline-none focus:bg-pink-500/10 focus:text-pink-300 transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Mis servicios
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('store')} active={route().current('store') || route().current('store.category')}>
                            Tienda
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={panelUrl}>Web principal ↗</ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-1 border-t border-pink-600/30">
                        <div className="px-4">
                            <div className="font-medium text-base text-pink-300">{user.name}</div>
                            <div className="font-medium text-sm text-gray-400">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="relative z-10 border-b border-pink-600/30 bg-black/60 shadow-[0_0_20px_rgba(255,0,150,0.15)] backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main className="relative z-10">{children}</main>
        </div>
    );
}
