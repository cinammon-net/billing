import { Link } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-pink-500 text-pink-300 focus:border-pink-400 '
                    : 'border-transparent text-gray-400 hover:text-pink-300 hover:border-pink-500/50 focus:text-pink-300 focus:border-pink-500/50 ') +
                className
            }
        >
            {children}
        </Link>
    );
}
