import { useTranslation } from 'react-i18next';
import { QrCode } from 'lucide-react';
import { cn } from '@/helpers/utils';
import { useQrRender } from '@/hooks/use-qr-render';

export const QrPicture = ({ render, className }) => {
    const { t } = useTranslation();

    if (!render.ok) {
        return (
            <div
                className={cn(
                    'flex-center aspect-square flex-col gap-2 rounded-2xl bg-white/60 p-4 text-center text-xs text-foreground/70 [&>svg]:size-8',
                    className,
                )}
            >
                <QrCode />
                {t(`editor.errors.${render.error}`, { defaultValue: t('card.unavailable') })}
            </div>
        );
    }

    return (
        <img
            src={render.url}
            alt=''
            draggable={false}
            decoding='async'
            className={cn('aspect-square size-full select-none object-contain', className)}
        />
    );
};

export const QrImage = ({ type, content, style, allowSample, className }) => {
    const render = useQrRender({ type, content, style, allowSample });
    return <QrPicture render={render} className={className} />;
};
