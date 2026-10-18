import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { Providers } from '@/providers/providers';
import { AppShell } from '@/components/layout/app-shell';
import { HomePage } from '@/pages/home';
import { DuplicateQrPage, EditQrPage, NewQrPage } from '@/pages/editor';
import { QrDetailPage } from '@/pages/qr-detail';
import { SettingsPage } from '@/pages/settings';
import { NotFoundPage } from '@/pages/not-found';

const rootRoute = createRootRoute({
    component: () => (
        <Providers>
            <Outlet />
        </Providers>
    ),
    notFoundComponent: NotFoundPage,
});

const shellRoute = createRoute({ getParentRoute: () => rootRoute, id: 'shell', component: AppShell });

const page = (path, component) => createRoute({ getParentRoute: () => shellRoute, path, component });

const routeTree = rootRoute.addChildren([
    shellRoute.addChildren([
        page('/', HomePage),
        page('/new', NewQrPage),
        page('/q/$id', QrDetailPage),
        page('/q/$id/edit', EditQrPage),
        page('/q/$id/duplicate', DuplicateQrPage),
        page('/settings', SettingsPage),
    ]),
]);

export const router = createRouter({ routeTree });
