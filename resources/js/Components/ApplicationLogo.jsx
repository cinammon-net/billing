export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            {...props}
            src="/favicon.ico"
            alt="Cinammon.net Logo"
            draggable={false}
            className={className}
        />
    );
}
