import { useTranslation } from 'react-i18next';
import { ClearDataSection } from '@/components/settings/clear-data-section';
import { IdentitySection } from '@/components/settings/identity-section';
import { ShareSettingsSection } from '@/components/settings/share-settings-section';

export const SettingsPage = () => {
    const { t } = useTranslation();

    return (
        <div className='mx-auto flex w-full max-w-lg flex-col gap-8'>
            <h2 className='text-2xl font-bold tracking-tight'>{t('settings.title')}</h2>
            <IdentitySection />
            <ShareSettingsSection />
            <ClearDataSection />
        </div>
    );
};
