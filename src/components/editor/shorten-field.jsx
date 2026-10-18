import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Link2 } from 'lucide-react';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';
import { ensureScheme, url as urlType } from '@/content-types/url';
import { shorten } from '@/services/shortener';

const SHORTEN_DELAY = 600;

const useShortener = (values, onChange) => {
    const [status, setStatus] = useState('idle');
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!values.shorten || values.short_url) {
            setStatus('idle');
            return;
        }
        if (urlType.validate(values).url) {
            setStatus('waiting');
            return;
        }
        const controller = new AbortController();
        setStatus('loading');
        const timer = setTimeout(async () => {
            try {
                const short = await shorten(ensureScheme(values.url), { signal: controller.signal });
                onChange({ short_url: short });
            } catch {
                if (!controller.signal.aborted) setStatus('error');
            }
        }, SHORTEN_DELAY);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [values.shorten, values.url, values.short_url, attempt]);

    return { status, retry: () => setAttempt(current => current + 1) };
};

const ShortLink = ({ status, shortUrl, onRetry }) => {
    const { t } = useTranslation();
    const [, copy] = useCopyToClipboard();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timeout = setTimeout(() => setCopied(false), 1500);
        return () => clearTimeout(timeout);
    }, [copied]);

    if (status === 'error') {
        return (
            <div className='flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                {t('shorten.error')}
                <Button variant='outline' className='h-9' onClick={onRetry}>
                    {t('common.retry')}
                </Button>
            </div>
        );
    }

    if (!shortUrl) {
        return (
            <p className='rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground'>
                {status === 'loading' ? t('shorten.shortening') : t('shorten.waiting')}
            </p>
        );
    }

    return (
        <div className='flex flex-col gap-1.5'>
            <Label>{t('shorten.shortLink')}</Label>
            <div className='flex gap-2'>
                <Input readOnly value={shortUrl} onFocus={event => event.target.select()} className='h-11 font-mono text-sm' />
                <Button
                    variant='outline'
                    size='icon'
                    aria-label={t('common.copy')}
                    className='size-11 shrink-0'
                    onClick={() => {
                        copy(shortUrl);
                        setCopied(true);
                    }}
                >
                    {copied ? <Check /> : <Copy />}
                </Button>
            </div>
        </div>
    );
};

export const ShortenField = ({ values, onChange }) => {
    const { t } = useTranslation();
    const { status, retry } = useShortener(values, onChange);

    return (
        <div className='flex flex-col gap-3 rounded-xl border border-border bg-card p-3'>
            <div className='flex items-center justify-between gap-3'>
                <div className='flex min-w-0 flex-col gap-0.5'>
                    <Label className='[&>svg]:size-4'>
                        <Link2 />
                        {t('shorten.label')}
                    </Label>
                    <p className='text-xs text-muted-foreground'>{t('shorten.description')}</p>
                </div>
                <Switch checked={!!values.shorten} onCheckedChange={checked => onChange({ shorten: checked })} />
            </div>
            {values.shorten && <ShortLink status={status} shortUrl={values.short_url} onRetry={retry} />}
        </div>
    );
};
