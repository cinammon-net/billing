import ApplicationLogo from '@/Components/ApplicationLogo';
import { usePage } from '@inertiajs/react';

export default function Guest({ children }) {
    const { panelUrl } = usePage().props;

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 font-sans text-white">
            <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-br from-pink-500/10 via-purple-700/10 to-blue-500/10" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,#ff44cc33_1px,transparent_1px)] bg-[length:20px_20px] opacity-10" />

            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-pink-500/20 p-8 shadow-2xl">
                <div className="animate-spin-slow absolute top-[-50%] left-[-50%] z-[-2] h-[200%] w-[200%] bg-[conic-gradient(from_0deg,#ff44cc,#5500ff,#44ccff,#ff44cc)]" />
                <div className="absolute inset-1 z-[-1] rounded-[0.625rem] bg-black/90" />

                <div className="mb-6 text-center">
                    <div className="mb-4 flex justify-center">
                        <a href={panelUrl} title="Volver a cinammon.net">
                            <ApplicationLogo className="h-20 sm:h-22" />
                        </a>
                    </div>
                    <h1 className="text-2xl font-bold tracking-wide text-pink-400">
                        <span className="text-[#00f7ff]">cinammon</span>.net billing
                    </h1>
                </div>

                {children}
            </div>
        </div>
    );
}
