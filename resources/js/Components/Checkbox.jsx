export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-pink-600/40 bg-black/80 text-pink-500 shadow-sm focus:ring-pink-500 focus:ring-offset-black ' +
                className
            }
        />
    );
}
