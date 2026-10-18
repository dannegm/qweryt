import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/ui/delete-confirm-dialog';
import { cache } from '@/helpers/cache';
import { ensureIdentity } from '@/helpers/identity';
import { settings } from '@/helpers/settings';

const clearOfflineCaches = async () => {
    if (!('caches' in window)) return;
    await caches.delete('qweryt-runtime');
};

export const ClearDataSection = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const handleClear = async () => {
        settings.setAll({});
        cache.clear();
        ensureIdentity();
        queryClient.clear();
        await clearOfflineCaches();
        toast.success(t('settings.clear.done'));
    };

    return (
        <section className='flex flex-col gap-3'>
            <h2 className='text-base font-semibold'>{t('settings.clear.title')}</h2>
            <p className='text-sm text-muted-foreground'>{t('settings.clear.description')}</p>
            <DeleteConfirmDialog
                title={t('settings.clear.dialogTitle')}
                confirmWord={t('settings.clear.confirmWord')}
                label={t('settings.clear.label')}
                className='h-11'
                onConfirm={handleClear}
            />
        </section>
    );
};
