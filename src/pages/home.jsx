import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { parseAsString, useQueryState } from 'nuqs';
import { Plus, QrCode, Search } from 'lucide-react';
import { QrLibrary, useFilteredQrs } from '@/components/library/qr-library';
import { Button } from '@/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/ui/empty';
import { Input } from '@/ui/input';
import { Skeleton } from '@/ui/skeleton';
import { useIdentity } from '@/hooks/use-identity';
import { qrsQuery } from '@/queries/qrs';

const LibrarySkeleton = () => (
    <div className='flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3'>
        {[0, 1, 2].map(index => (
            <Skeleton key={index} className='h-20 rounded-3xl sm:h-96' />
        ))}
    </div>
);

const LibraryError = ({ onRetry }) => {
    const { t } = useTranslation();
    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>{t('home.loadError')}</EmptyTitle>
            </EmptyHeader>
            <Button variant='outline' className='h-10' onClick={onRetry}>
                {t('common.retry')}
            </Button>
        </Empty>
    );
};

const LibraryEmpty = () => {
    const { t } = useTranslation();
    return (
        <Empty className='border border-border bg-card'>
            <EmptyHeader>
                <EmptyMedia variant='icon'>
                    <QrCode />
                </EmptyMedia>
                <EmptyTitle>{t('home.emptyTitle')}</EmptyTitle>
                <EmptyDescription>{t('home.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
            <Button render={<Link to='/new' />} nativeButton={false} className='h-11 px-5'>
                <Plus />
                {t('home.emptyAction')}
            </Button>
        </Empty>
    );
};

const NoResults = ({ query }) => {
    const { t } = useTranslation();
    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>{t('home.noResults', { query })}</EmptyTitle>
            </EmptyHeader>
        </Empty>
    );
};

const LibraryResults = ({ qrs, query, user }) => {
    const filtered = useFilteredQrs(qrs, query);
    if (!qrs.length) return <LibraryEmpty />;
    if (!filtered.length) return <NoResults query={query.trim()} />;
    return <QrLibrary qrs={filtered} user={user} />;
};

export const HomePage = () => {
    const { t } = useTranslation();
    const { user } = useIdentity();
    const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
    const { data, isPending, isError, refetch } = useQuery(qrsQuery(user.id));

    return (
        <div className='flex flex-col gap-5 pb-24'>
            <div className='flex flex-col gap-3'>
                <h2 className='text-2xl font-bold tracking-tight'>{t('home.title')}</h2>
                <div className='relative'>
                    <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                    <Input
                        value={query}
                        onChange={event => setQuery(event.target.value || null)}
                        placeholder={t('home.searchPlaceholder')}
                        aria-label={t('home.searchPlaceholder')}
                        className='h-11 bg-card pl-9'
                    />
                </div>
            </div>
            {isPending && <LibrarySkeleton />}
            {isError && !data && <LibraryError onRetry={refetch} />}
            {data && <LibraryResults qrs={data} query={query} user={user} />}
            <Button
                render={<Link to='/new' />}
                nativeButton={false}
                className='fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-30 h-14 rounded-full px-6 text-base shadow-lg shadow-primary/40 [&>svg]:size-5'
            >
                <Plus />
                {t('home.newQr')}
            </Button>
        </div>
    );
};
