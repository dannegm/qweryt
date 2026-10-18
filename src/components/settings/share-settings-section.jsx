import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Link2 } from 'lucide-react';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { toast } from 'sonner';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { cn } from '@/helpers/utils';
import { settings } from '@/helpers/settings';
import { syncProfile } from '@/queries/profiles';
import { clearShareHash, createShareLink, getShareHash, readShareLink } from '@/helpers/share-settings';

const Card = ({ title, description, children }) => (
    <div className='flex flex-col gap-3 rounded-xl border border-border bg-card p-4'>
        <div className='flex flex-col gap-0.5'>
            <h3 className='text-sm font-semibold'>{title}</h3>
            <p className='text-sm text-muted-foreground'>{description}</p>
        </div>
        {children}
    </div>
);

const applyLink = (link, t) => {
    const data = readShareLink(link, t('settings.share.invalid'));
    settings.setAll({ ...settings.getAll(), ...data });
    if (data.user) syncProfile(data.user);
    clearShareHash();
    toast.success(t('settings.share.applied'));
};

const ShareCard = () => {
    const { t } = useTranslation();
    const [link, setLink] = useState('');
    const [, copy] = useCopyToClipboard();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timeout = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timeout);
    }, [copied]);

    const handleGenerate = () => {
        const nextLink = createShareLink(settings.getAll());
        setLink(nextLink);
        copy(nextLink);
        setCopied(true);
        toast.success(t('settings.share.copiedLink'));
    };

    return (
        <Card title={t('settings.share.generateTitle')} description={t('settings.share.generateDescription')}>
            {link && (
                <Input
                    readOnly
                    value={link}
                    onFocus={event => event.target.select()}
                    className={cn('h-11 font-mono text-xs transition-shadow duration-300', {
                        'ring-3 ring-emerald-500/60': copied,
                    })}
                />
            )}
            <Button
                size='lg'
                className={cn('h-11 transition-colors duration-200', {
                    'bg-emerald-600 text-white hover:bg-emerald-600': copied,
                })}
                onClick={handleGenerate}
            >
                {copied ? <Check /> : link ? <Copy /> : <Link2 />}
                {copied
                    ? t('settings.share.copiedLink')
                    : link
                      ? t('settings.share.copyAgain')
                      : t('settings.share.generate')}
            </Button>
        </Card>
    );
};

const ApplyCard = () => {
    const { t } = useTranslation();
    const [link, setLink] = useState('');

    const handleApply = () => {
        try {
            applyLink(link.trim(), t);
            setLink('');
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <Card title={t('settings.share.applyTitle')} description={t('settings.share.applyDescription')}>
            <Input
                value={link}
                onChange={event => setLink(event.target.value)}
                placeholder={t('settings.share.applyPlaceholder')}
                className='h-11 font-mono text-xs'
            />
            <Button size='lg' className='h-11' disabled={!link.trim()} onClick={handleApply}>
                {t('settings.share.apply')}
            </Button>
        </Card>
    );
};

export const ShareSettingsSection = () => {
    const { t } = useTranslation();

    useEffect(() => {
        const link = getShareHash();
        if (!link) return;
        try {
            applyLink(link, t);
        } catch (error) {
            toast.error(error.message);
            clearShareHash();
        }
    }, []);

    return (
        <section className='flex flex-col gap-3'>
            <h2 className='text-base font-semibold'>{t('settings.share.title')}</h2>
            <ShareCard />
            <ApplyCard />
        </section>
    );
};
