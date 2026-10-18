import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';

import '@/i18n';
import { router } from '@/router';
import { ensureIdentity } from '@/helpers/identity';
import { registerServiceWorker } from '@/helpers/pwa';
import { settings } from '@/helpers/settings';
import './css/index.css';

settings.registerDevTools();
ensureIdentity();

registerServiceWorker();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
