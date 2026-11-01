export default function DangerButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-md border border-red-500/50 bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-[0_0_12px_rgba(255,0,60,0.35)] transition ease-in-out duration-150 hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
