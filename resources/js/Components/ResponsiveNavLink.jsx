import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={`w-full flex items-start ps-3 pe-4 py-2 border-l-4 ${
                active
                    ? 'border-pink-500 text-pink-300 bg-pink-500/10 focus:text-pink-200 focus:bg-pink-500/20 focus:border-pink-400'
                    : 'border-transparent text-gray-400 hover:text-pink-300 hover:bg-pink-500/10 hover:border-pink-500/50 focus:text-pink-300 focus:bg-pink-500/10 focus:border-pink-500/50'
            } text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
        >
            {children}
        </Link>
    );
}
