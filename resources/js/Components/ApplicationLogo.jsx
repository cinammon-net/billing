import { useId } from 'react';

/** Hexágono de Cinammon (mismo símbolo que el panel), en vectorial para que se vea nítido a cualquier tamaño. */
export default function ApplicationLogo({ className = '', ...props }) {
    const gradient = `cin-logo-${useId().replace(/:/g, '')}`;
    return (
        <svg {...props} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cinammon.net" className={className}>
            <defs>
                <linearGradient id={gradient} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff4da6" />
                    <stop offset="100%" style={{ stopColor: 'oklch(var(--tw-c-neon))' }} />
                </linearGradient>
            </defs>
            <path fillRule="evenodd" d="M50 5L90 30V70L50 95L10 70V30L50 5Z M50 20L25 35V65L50 80L75 65V35L50 20Z" fill={`url(#${gradient})`} />
        </svg>
    );
}
