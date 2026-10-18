import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/button';

export const NotFoundPage = () => {
    const { t } = useTranslation();

    return (
        <main className='flex min-h-dvh flex-col items-center justify-center gap-4 p-6'>
            <h1 className='text-2xl font-semibold'>{t('notFound.title')}</h1>
            <Button render={<Link to='/' />} nativeButton={false}>
                {t('notFound.back')}
            </Button>
        </main>
    );
};
