import './bootstrap';
import '../css/app.css';
import './lib/cinammon-fx.css';
import './lib/cinammon-fx.js'; // ojo para ver contraseñas y animaciones en todas las páginas

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// Nombre en la pestaña según el subdominio (store.cinammon.net -> Cinammon Store)
const appName = typeof window !== 'undefined' && window.location.hostname.startsWith('store.') ? 'Cinammon Store' : 'Cinammon';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
