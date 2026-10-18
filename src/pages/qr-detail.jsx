import { useMemo } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Copy, Plus } from 'lucide-react';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { toast } from 'sonner';
import { ExportButtons } from '@/components/editor/export-buttons';
import { QrCard } from '@/components/qr/qr-card';
import { QrCardActions } from '@/components/qr/qr-card-actions';
import { QrLoadError, QrLoading, QrNotFound } from '@/components/qr/qr-states';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { encodeContent } from '@/content-types';
import { normalizeStyle } from '@/engine/style';
import { useIdentity } from '@/hooks/use-identity';
import { useQrRender } from '@/hooks/use-qr-render';
import { getQrLink, getQrTitle, isOwner, toFilename } from '@/helpers/qr';
import { qrQuery } from '@/queries/qrs';

const QrDetail = ({ qr, user }) => {
    const { t } = useTranslation();
    const [, copy] = useCopyToClipboard();
    const style = useMemo(() => normalizeStyle(qr.style), [qr.style]);
    const render = useQrRender({ type: qr.type, content: qr.content, style });
    const mine = isOwner(qr, user);
    const title = getQrTitle(qr, t);

    const handleCopyLink = () => {
        copy(getQrLink(qr.id));
        toast.success(t('detail.linkCopied'));
    };

    return (
        <div className='mx-auto grid w-full max-w-md gap-6 lg:max-w-4xl lg:grid-cols-2 lg:items-start lg:gap-10'>
            <QrCard
                qr={qr}
                showOwner
                isMine={mine}
                actions={<QrCardActions qr={qr} isMine={mine} profileId={user.id} openLink={false} redirectOnDelete />}
            />
            <div className='flex flex-col gap-6'>
                <section className='flex flex-col gap-2.5'>
                    <Label>{t('detail.download')}</Label>
                    <ExportButtons svg={render.svg} filename={toFilename(title)} disabled={!render.ok} />
                </section>
                <section className='flex flex-col gap-2.5'>
                    <Button variant='outline' className='h-11 bg-card' onClick={handleCopyLink}>
                        <Copy />
                        {t('detail.copyLink')}
                    </Button>
                </section>
                <section className='flex flex-col gap-2'>
                    <Label>{t('detail.content')}</Label>
                    <pre className='max-h-48 overflow-auto rounded-xl border border-border bg-card p-3 font-mono text-xs break-all whitespace-pre-wrap'>
                        {encodeContent(qr.type, qr.content)}
                    </pre>
                </section>
                <Button render={<Link to='/new' />} nativeButton={false} className='h-12'>
                    <Plus />
                    {t('detail.createYours')}
                </Button>
            </div>
        </div>
    );
};

export const QrDetailPage = () => {
    const { id } = useParams({ strict: false });
    const { user } = useIdentity();
    const { data: qr, isPending, isError, refetch } = useQuery(qrQuery(id));

    if (isPending) return <QrLoading />;
    if (isError) return <QrLoadError onRetry={refetch} />;
    if (!qr) return <QrNotFound />;
    return <QrDetail qr={qr} user={user} />;
};
