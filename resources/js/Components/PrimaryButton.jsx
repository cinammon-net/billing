export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-md bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow transition ease-in-out duration-150 hover:from-pink-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
