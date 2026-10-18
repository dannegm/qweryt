import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { QrCode } from 'lucide-react';
import { Button } from '@/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/ui/empty';
import { Skeleton } from '@/ui/skeleton';

export const QrLoading = () => (
    <div className='mx-auto flex w-full max-w-md flex-col gap-4'>
        <Skeleton className='h-96 rounded-3xl' />
    </div>
);

export const QrNotFound = () => {
    const { t } = useTranslation();
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant='icon'>
                    <QrCode />
                </EmptyMedia>
                <EmptyTitle>{t('detail.notFoundTitle')}</EmptyTitle>
                <EmptyDescription>{t('detail.notFoundDescription')}</EmptyDescription>
            </EmptyHeader>
            <Button render={<Link to='/' />} nativeButton={false} className='h-11'>
                {t('notFound.back')}
            </Button>
        </Empty>
    );
};

export const QrLoadError = ({ onRetry }) => {
    const { t } = useTranslation();
    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>{t('detail.loadError')}</EmptyTitle>
            </EmptyHeader>
            <Button variant='outline' className='h-11' onClick={onRetry}>
                {t('common.retry')}
            </Button>
        </Empty>
    );
};

export const NotOwner = ({ id }) => {
    const { t } = useTranslation();
    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>{t('editor.notOwner')}</EmptyTitle>
            </EmptyHeader>
            <Button render={<Link to='/q/$id' params={{ id }} />} nativeButton={false} className='h-11'>
                {t('common.back')}
            </Button>
        </Empty>
    );
};
