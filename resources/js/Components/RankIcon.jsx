import { useId } from 'react';

export const VIP_RANKS = [
    { key: 'chispa', role: 'Chispa', name: 'Chispa', label: 'VIP Chispa', color: '#f59e0b', secondary: '#fde047', icon: 'sparkles', tier: 'I' },
    { key: 'neon', role: 'Neón', name: 'Neón', label: 'VIP Neón', color: '#e879f9', secondary: '#f43f5e', icon: 'zap', tier: 'II' },
    { key: 'synthwave', role: 'Synthwave', name: 'Synthwave', label: 'VIP Synthwave', color: '#d946ef', secondary: '#fb923c', icon: 'audio-waveform', tier: 'III' },
    { key: 'cibercanela', role: 'Cibercanela', name: 'Cibercanela', label: 'VIP Cibercanela', color: '#fb7185', secondary: '#f59e0b', icon: 'flame', tier: 'IV' },
    { key: 'leyenda', role: 'Leyenda Cinammon', name: 'Leyenda Cinammon', label: 'VIP Leyenda', color: '#facc15', secondary: '#ec4899', icon: 'crown', tier: 'V' },
    { key: 'arquitecto', role: 'Arquitecto de Mundos', name: 'Arquitecto de Mundos', label: 'VIP Arquitecto', color: '#34d399', secondary: '#a7f3d0', icon: 'blocks', tier: 'ESP' },
    { key: 'desarrollador', role: 'Desarrollador', name: 'Desarrollador', label: 'VIP Desarrollador', color: '#818cf8', secondary: '#e879f9', icon: 'code', tier: 'ESP' },
    { key: 'creador', role: 'Creador de Contenido', name: 'Creador de Contenido', label: 'VIP Creador', color: '#f43f5e', secondary: '#c084fc', icon: 'video', tier: 'ESP' },
    { key: 'comandante', role: 'Comandante de Clan', name: 'Comandante de Clan', label: 'VIP Comandante', color: '#f97316', secondary: '#facc15', icon: 'swords', tier: 'ESP' },
    { key: 'mecenas', role: 'Mecenas', name: 'Mecenas', label: 'VIP Mecenas', color: '#eab308', secondary: '#f472b6', icon: 'gem', tier: 'ESP' },
];

export function getRankMeta(roleOrName) {
    const lower = (roleOrName || '').trim().toLowerCase();
    return (
        VIP_RANKS.find((r) => r.name.toLowerCase() === lower || r.key === lower || r.icon === lower) || {
            key: 'leyenda',
            role: roleOrName || 'VIP',
            name: roleOrName || 'VIP',
            label: roleOrName || 'VIP',
            color: '#facc15',
            secondary: '#ec4899',
            icon: 'crown',
            tier: 'VIP',
        }
    );
}

/**
 * Iconos vectoriales originales diseñados a medida para cada rango VIP de Cinammon.
 */
export default function RankIcon({ role, icon, size, className = 'h-6 w-6' }) {
    const uid = useId().replace(/:/g, '');
    const meta = getRankMeta(role || icon);
    const key = icon || meta.icon;
    const c1 = meta.color;
    const c2 = meta.secondary;

    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            width={size}
            height={size}
            className={size ? className.replace(/\bh-\S+|\bw-\S+/g, '').trim() : className}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={`rg-${uid}`} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={c2} />
                    <stop offset="55%" stopColor={c1} />
                    <stop offset="100%" stopColor={c2} />
                </linearGradient>
                <radialGradient id={`rc-${uid}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="60%" stopColor={c2} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={c1} stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* 1. CHISPA */}
            {(key === 'sparkles' || key === 'chispa') && (
                <>
                    <polygon points="16,2 28,16 16,30 4,16" stroke={`url(#rg-${uid})`} strokeWidth="1.6" strokeDasharray="3 1.5" fill={c1} fillOpacity="0.12" />
                    <path d="M16 3L19.2 12.8L29 16L19.2 19.2L16 29L12.8 19.2L3 16L12.8 12.8L16 3Z" fill={`url(#rg-${uid})`} />
                    <path d="M7 7L13 13M25 7L19 13M7 25L13 19M25 25L19 19" stroke={c2} strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="16" cy="16" r="4" fill={`url(#rc-${uid})`} />
                    <circle cx="7" cy="7" r="1.5" fill={c2} />
                    <circle cx="25" cy="7" r="1.5" fill={c2} />
                    <circle cx="7" cy="25" r="1.5" fill={c2} />
                    <circle cx="25" cy="25" r="1.5" fill={c2} />
                </>
            )}

            {/* 2. NEÓN */}
            {(key === 'zap' || key === 'neon') && (
                <>
                    <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke={`url(#rg-${uid})`} strokeWidth="1.8" fill={c1} fillOpacity="0.14" />
                    <path d="M18.5 3.5L7.5 17H15.5L13 28.5L24.5 14.5H16.5L18.5 3.5Z" fill={`url(#rg-${uid})`} stroke="#ffffff" strokeWidth="0.8" strokeLinejoin="round" />
                    <path d="M4 13H8M24 19H28" stroke={c2} strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="16" cy="16" r="2.3" fill="#ffffff" />
                </>
            )}

            {/* 3. SYNTHWAVE */}
            {(key === 'audio-waveform' || key === 'synthwave') && (
                <>
                    <circle cx="16" cy="14" r="9.5" fill={`url(#rg-${uid})`} />
                    <path d="M5 13.5H27M5 16.5H27M6 19.5H26" stroke="#090414" strokeWidth="1.5" />
                    <path d="M2 23H30" stroke={c2} strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M4 28L11 23M28 28L21 23M16 23V29" stroke={c1} strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M8 12L11 8L14 13L16 6L18 13L21 9L24 12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
            )}

            {/* 4. CIBERCANELA */}
            {(key === 'flame' || key === 'cibercanela') && (
                <>
                    <path
                        d="M16 2.5C16 2.5 25.5 9.5 25.5 18.5C25.5 24.3 21.2 29 16 29C10.8 29 6.5 24.3 6.5 18.5C6.5 14 9.5 10.5 11.5 8.5C11.2 12 13.5 13.5 14.5 12C15.8 10 14.2 5.8 16 2.5Z"
                        fill={`url(#rg-${uid})`}
                    />
                    <path
                        d="M16 12.5C19.5 12.5 21.5 15.2 21.5 18.5C21.5 21.5 19 24 16 24C13.5 24 11.8 22.2 11.8 19.8C11.8 17.8 13.4 16.4 15.2 16.4C16.8 16.4 17.8 17.5 17.5 19C17.2 20.2 15.8 20.5 15 19.6"
                        stroke="#090414"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <circle cx="16" cy="19" r="2.2" fill="#ffffff" />
                    <circle cx="8" cy="7" r="1.3" fill={c2} />
                    <circle cx="24" cy="7" r="1.3" fill={c2} />
                </>
            )}

            {/* 5. LEYENDA CINAMMON */}
            {(key === 'crown' || key === 'leyenda') && (
                <>
                    <path d="M16 2L18.5 6.5L16 9.5L13.5 6.5L16 2Z" fill={c2} />
                    <path
                        d="M3.5 11L9.5 17.5L16 9.5L22.5 17.5L28.5 11L25.5 24.5H6.5L3.5 11Z"
                        fill={`url(#rg-${uid})`}
                        stroke="#ffffff"
                        strokeWidth="0.9"
                        strokeLinejoin="round"
                    />
                    <rect x="6" y="26" width="20" height="3" rx="1.5" fill={c1} />
                    <circle cx="16" cy="17.5" r="2.2" fill="#ffffff" />
                    <circle cx="10" cy="20" r="1.4" fill={c2} />
                    <circle cx="22" cy="20" r="1.4" fill={c2} />
                    <circle cx="4" cy="8.5" r="1.3" fill={c2} />
                    <circle cx="28" cy="8.5" r="1.3" fill={c2} />
                </>
            )}

            {/* 6. ARQUITECTO DE MUNDOS */}
            {(key === 'blocks' || key === 'arquitecto') && (
                <>
                    <polygon points="16,3 27,9.5 27,22.5 16,29 5,22.5 5,9.5" fill={c1} fillOpacity="0.18" stroke={`url(#rg-${uid})`} strokeWidth="1.6" />
                    <polygon points="16,3 27,9.5 16,16 5,9.5" fill={`url(#rg-${uid})`} fillOpacity="0.85" />
                    <polygon points="5,9.5 16,16 16,29 5,22.5" fill={c1} fillOpacity="0.65" />
                    <polygon points="27,9.5 16,16 16,29 27,22.5" fill={c2} fillOpacity="0.45" />
                    <polygon points="16,9 21.5,12.2 16,15.5 10.5,12.2" fill="#ffffff" />
                    <path d="M16 16V29M5 9.5L16 16L27 9.5" stroke="#090414" strokeWidth="1.4" />
                </>
            )}

            {/* 7. COMANDANTE DE CLAN */}
            {(key === 'swords' || key === 'comandante') && (
                <>
                    <path d="M5 5L27 27M27 5L5 27" stroke={c2} strokeWidth="2.4" strokeLinecap="round" />
                    <polygon points="4,4 9,5 5,9" fill={c2} />
                    <polygon points="28,4 23,5 27,9" fill={c2} />
                    <path
                        d="M16 5.5L24.5 9V16.5C24.5 22 20.8 26.2 16 28C11.2 26.2 7.5 22 7.5 16.5V9L16 5.5Z"
                        fill={`url(#rg-${uid})`}
                        stroke="#ffffff"
                        strokeWidth="1"
                    />
                    <path d="M12 15.5L16 11.5L20 15.5L16 22.5L12 15.5Z" fill="#090414" />
                    <circle cx="16" cy="16" r="2" fill="#ffffff" />
                </>
            )}

            {/* 8. CREADOR DE CONTENIDO */}
            {(key === 'video' || key === 'creador') && (
                <>
                    <circle cx="16" cy="16" r="12" stroke={`url(#rg-${uid})`} strokeWidth="1.8" strokeDasharray="5 2.5" fill={c1} fillOpacity="0.12" />
                    <circle cx="16" cy="16" r="8.5" fill={`url(#rg-${uid})`} />
                    <polygon points="13.5,11.5 21.5,16 13.5,20.5" fill="#ffffff" />
                    <circle cx="24.5" cy="7.5" r="2.2" fill="#f43f5e" stroke="#ffffff" strokeWidth="0.9" />
                </>
            )}

            {/* 9. DESARROLLADOR */}
            {(key === 'code' || key === 'desarrollador') && (
                <>
                    <rect x="7" y="7" width="18" height="18" rx="4" fill={`url(#rg-${uid})`} stroke="#ffffff" strokeWidth="0.9" />
                    <path d="M11 3V7M16 3V7M21 3V7M11 25V29M16 25V29M21 25V29M3 11H7M3 16H7M3 21H7M25 11H29M25 16H29M25 21H29" stroke={c2} strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M13 12.5L9.8 16L13 19.5M19 12.5L22.2 16L19 19.5M17 11.5L15 20.5" stroke="#090414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
            )}

            {/* 10. MECENAS */}
            {(key === 'gem' || key === 'mecenas') && (
                <>
                    <circle cx="16" cy="16" r="13" stroke={c1} strokeWidth="1.3" strokeDasharray="2 2" />
                    <polygon points="10,6 22,6 28,13 16,28 4,13" fill={`url(#rg-${uid})`} stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" />
                    <path d="M4 13H28M10 6L13 13L16 28L19 13L22 6" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.75" strokeLinejoin="round" />
                    <circle cx="16" cy="11" r="2" fill="#ffffff" />
                </>
            )}
        </svg>
    );
}

/**
 * Emblema enmarcado con resplandor para tarjetas de planes VIP, modales y cabeceras.
 */
export function RankEmblem({ role, size = 'md' }) {
    const meta = getRankMeta(role);
    const boxCls =
        size === 'sm'
            ? 'h-9 w-9 rounded-lg'
            : size === 'lg'
              ? 'h-16 w-16 rounded-2xl'
              : 'h-14 w-14 rounded-xl';
    const iconCls = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';

    return (
        <div
            title={`Insignia original: ${meta.name}`}
            className={`relative flex shrink-0 items-center justify-center border bg-[#060814] transition-transform duration-300 group-hover:scale-105 ${boxCls}`}
            style={{
                borderColor: `${meta.color}99`,
                background: `radial-gradient(circle at 30% 25%, ${meta.color}38, #060814 75%)`,
                boxShadow: `0 0 22px ${meta.color}40, inset 0 0 12px ${meta.color}25`,
            }}
        >
            <RankIcon role={meta.name} icon={meta.icon} className={iconCls} />
        </div>
    );
}
