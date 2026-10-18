import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Copy, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/ui/button';
import { ConfirmDrawer } from '@/ui/confirm-drawer';
import { getQrTitle } from '@/helpers/qr';
import { deleteQrMutation } from '@/queries/qrs';

const ACTION_CLASS =
    'h-10 flex-1 rounded-xl border-0 bg-(--card-fg)/15 text-(--card-fg) hover:bg-(--card-fg)/25 active:bg-(--card-fg)/25';

export const QrCardActions = ({ qr, isMine, profileId, openLink = true, redirectOnDelete = false }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [confirming, setConfirming] = useState(false);

    const remove = useMutation(
        deleteQrMutation({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['qrs'] });
                setConfirming(false);
                toast.success(t('card.deleted'));
                if (redirectOnDelete) navigate({ to: '/' });
            },
            onError: () => toast.error(t('card.deleteError')),
        }),
    );

    return (
        <div className='flex flex-col gap-2'>
            {openLink && (
                <Button
                    render={<Link to='/q/$id' params={{ id: qr.id }} />}
                    nativeButton={false}
                    className='h-11 rounded-xl bg-(--card-fg) text-(--card-color) hover:bg-(--card-fg)/90 [&>svg]:size-4'
                >
                    <ExternalLink />
                    {t('card.open')}
                </Button>
            )}
            <div className='flex gap-2'>
                {isMine && (
                    <Button
                        render={<Link to='/q/$id/edit' params={{ id: qr.id }} />}
                        nativeButton={false}
                        className={ACTION_CLASS}
                    >
                        <Pencil />
                        {t('card.edit')}
                    </Button>
                )}
                <Button
                    render={<Link to='/q/$id/duplicate' params={{ id: qr.id }} />}
                    nativeButton={false}
                    className={ACTION_CLASS}
                >
                    <Copy />
                    {t('card.duplicate')}
                </Button>
                {isMine && (
                    <Button className={ACTION_CLASS} onClick={() => setConfirming(true)}>
                        <Trash2 />
                        {t('card.delete')}
                    </Button>
                )}
            </div>
            <ConfirmDrawer
                open={confirming}
                onOpenChange={setConfirming}
                title={t('card.deleteTitle')}
                description={t('card.deleteDescription', { title: getQrTitle(qr, t) })}
                pending={remove.isPending}
                onConfirm={() => remove.mutate({ id: qr.id, profileId })}
            />
        </div>
    );
};
