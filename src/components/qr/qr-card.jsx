import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { QrImage } from '@/components/qr/qr-image';
import { UserAvatar } from '@/ui/user-avatar';
import { getContentType } from '@/content-types';
import { cn } from '@/helpers/utils';
import { getCardForeground } from '@/helpers/colors';
import { getQrTitle, getSummaryLines } from '@/helpers/qr';
import { normalizeStyle } from '@/engine/style';

const CardHeader = ({ qr, title, subtitle, collapsible, collapsed }) => {
    const { t } = useTranslation();
    const type = getContentType(qr.type);
    const Icon = type.icon;

    return (
        <div className='flex items-center gap-3'>
            <span className='flex-center size-10 shrink-0 rounded-xl bg-(--card-fg)/15 [&>svg]:size-5'>
                <Icon />
            </span>
            <div className='flex min-w-0 flex-1 flex-col'>
                <h3 className='truncate text-base leading-tight font-semibold'>{title}</h3>
                <p className='truncate text-xs text-(--card-fg)/75'>{subtitle ?? t(`types.${type.id}.label`)}</p>
            </div>
            {collapsible && (
                <ChevronDown
                    className={cn('size-5 shrink-0 text-(--card-fg)/75 transition-transform sm:hidden', {
                        'rotate-180': !collapsed,
                    })}
                />
            )}
        </div>
    );
};

const CardDetails = ({ qr }) => {
    const { t } = useTranslation();
    const lines = getSummaryLines(qr, t).slice(0, 4);

    return (
        <dl className='flex flex-col gap-1.5'>
            {lines.map(line => (
                <div key={line.key} className='flex items-baseline gap-3 text-sm'>
                    <dt className='w-24 shrink-0 truncate text-xs text-(--card-fg)/70'>{line.label}</dt>
                    <dd className='min-w-0 flex-1 truncate font-medium'>{line.value}</dd>
                </div>
            ))}
        </dl>
    );
};

const CardFooter = ({ qr, showOwner, isMine }) => {
    const { t } = useTranslation();
    const created = format(new Date(qr.created_at), 'MMM d, yyyy');

    return (
        <div className='flex items-center justify-between gap-3 text-xs text-(--card-fg)/75'>
            <span>{t('card.created', { date: created })}</span>
            {showOwner && qr.profile && (
                <span className='flex min-w-0 items-center gap-1.5'>
                    <UserAvatar profile={qr.profile} className='size-5' />
                    <span className='truncate'>{isMine ? t('card.you') : t('card.by', { name: qr.profile.name })}</span>
                </span>
            )}
        </div>
    );
};

export const QrCard = ({
    qr,
    collapsible = false,
    collapsed = false,
    onSelect,
    showOwner = false,
    isMine = false,
    actions,
    className,
}) => {
    const { t } = useTranslation();
    const title = getQrTitle(qr, t);
    const style = useMemo(() => normalizeStyle(qr.style), [qr.style]);
    const lines = getSummaryLines(qr, t);
    const isCollapsed = collapsible && collapsed;

    return (
        <div
            className={cn(
                'interpolate-size relative isolate transition-[height] duration-300',
                {
                    'h-20 [clip-path:inset(-1rem_-1rem_0_-1rem)] sm:h-auto sm:[clip-path:none]': isCollapsed,
                    'h-auto': !isCollapsed,
                },
                className,
            )}
        >
            <article
                className='flex flex-col gap-4 rounded-3xl bg-(--card-color) p-4 text-(--card-fg) shadow-lg shadow-black/20'
                style={{ '--card-color': qr.card_color, '--card-fg': getCardForeground(qr.card_color) }}
            >
                <button
                    type='button'
                    onClick={onSelect}
                    disabled={!collapsible}
                    className='block w-full text-left disabled:cursor-default'
                    aria-expanded={collapsible ? !isCollapsed : undefined}
                >
                    <CardHeader
                        qr={qr}
                        title={title}
                        subtitle={lines[0]?.value}
                        collapsible={collapsible}
                        collapsed={isCollapsed}
                    />
                </button>
                <div className='mx-auto w-full max-w-64 overflow-hidden rounded-2xl'>
                    <QrImage type={qr.type} content={qr.content} style={style} />
                </div>
                <CardDetails qr={qr} />
                <CardFooter qr={qr} showOwner={showOwner} isMine={isMine} />
                {actions}
            </article>
        </div>
    );
};
