import { useLayoutEffect } from 'react';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Plus, QrCode, Settings } from 'lucide-react';
import { Button } from '@/ui/button';
import { useOnlineStatus } from '@/hooks/use-online-status';

const CONTAINER = 'mx-auto w-full max-w-lg sm:max-w-3xl lg:max-w-6xl';

export const AppShell = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const isOnline = useOnlineStatus();

    useLayoutEffect(() => {
        window.scrollTo({ top: 0 });
    }, [pathname]);

    return (
        <div className='flex min-h-dvh flex-col'>
            <header className='pt-safe sticky top-0 z-20 bg-background shadow-[0_1px_0_0_var(--border)]'>
                <div className={`${CONTAINER} flex h-12 items-center justify-between pr-2`}>
                    <h1 className='h-full'>
                        <Link
                            to='/'
                            aria-label={t('nav.home')}
                            className='flex h-full w-fit items-center gap-2.5 px-4 transition-opacity active:opacity-70'
                        >
                            <span className='flex-center size-8 rounded-xl bg-linear-to-br from-indigo-400 to-indigo-600 text-white shadow-md shadow-indigo-500/40 [&>svg]:size-[1.125rem]'>
                                <QrCode />
                            </span>
                            <span className='text-xl font-bold tracking-tight text-primary'>qweryt</span>
                        </Link>
                    </h1>
                    <div className='flex items-center gap-1'>
                        <Button
                            render={<Link to='/new' />}
                            nativeButton={false}
                            className='hidden h-9 rounded-full px-4 sm:inline-flex'
                        >
                            <Plus />
                            {t('nav.newQr')}
                        </Button>
                        <Link
                            to='/settings'
                            aria-label={t('nav.settings')}
                            className='flex-center size-11 rounded-full text-foreground/70 transition-colors active:bg-muted data-[status=active]:text-primary [&>svg]:size-6'
                        >
                            <Settings />
                        </Link>
                    </div>
                </div>
            </header>
            <main className={`${CONTAINER} flex-1 px-4 pt-6 pb-10`}>
                <Outlet />
            </main>
            {!isOnline && (
                <div className='pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 flex justify-center'>
                    <span className='rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background shadow-md shadow-black/20'>
                        {t('common.offline')}
                    </span>
                </div>
            )}
            <div className='pointer-events-none fixed bottom-2 left-1/2 z-200 hidden h-1.75 w-33.5 -translate-x-1/2 rounded-full bg-foreground opacity-50 iphone-pwa:block' />
        </div>
    );
};
