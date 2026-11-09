import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const accent = (fam) => Object.fromEntries(shades.map((n) => [n, `oklch(var(--tw-c-${fam}-${n}) / <alpha-value>)`]));

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                pink: accent('pink'),
                fuchsia: accent('fuchsia'),
                purple: accent('purple'),
                cyan: accent('cyan'),
                neon: 'oklch(var(--tw-c-neon) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['Orbitron', ...defaultTheme.fontFamily.sans],
            },
            animation: {
                'spin-slow': 'spin 6s linear infinite',
            },
        },
    },

    plugins: [forms],
};
