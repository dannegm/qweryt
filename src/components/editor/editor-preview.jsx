import { useTranslation } from 'react-i18next';
import { Dices } from 'lucide-react';
import { QrPicture } from '@/components/qr/qr-image';
import { Button } from '@/ui/button';
import { getContentType } from '@/content-types';
import { getCardForeground } from '@/helpers/colors';

export const EditorPreview = ({ typeId, cardColor, title, render, onRandomize }) => {
    const { t } = useTranslation();
    const Icon = getContentType(typeId).icon;

    return (
        <div
            className='flex items-center gap-3 rounded-3xl bg-(--card-color) p-3 text-(--card-fg) shadow-lg shadow-black/20 transition-colors lg:flex-col lg:items-stretch lg:gap-4 lg:p-4'
            style={{ '--card-color': cardColor, '--card-fg': getCardForeground(cardColor) }}
        >
            <div className='flex min-w-0 flex-1 flex-col gap-3 lg:flex-none'>
                <div className='flex items-center gap-2.5'>
                    <span className='flex-center size-9 shrink-0 rounded-xl bg-(--card-fg)/15 [&>svg]:size-5'>
                        <Icon />
                    </span>
                    <div className='flex min-w-0 flex-col'>
                        <p className='truncate text-base leading-tight font-semibold'>{title}</p>
                        <p className='truncate text-xs text-(--card-fg)/75'>
                            {render.sample ? t('editor.sample') : t(`types.${typeId}.label`)}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={onRandomize}
                    className='h-10 w-fit rounded-full border-0 bg-(--card-fg)/15 px-4 text-(--card-fg) hover:bg-(--card-fg)/25 active:bg-(--card-fg)/25 [&>svg]:size-4.5'
                >
                    <Dices />
                    {t('editor.randomize')}
                </Button>
            </div>
            <div className='w-36 shrink-0 overflow-hidden rounded-2xl lg:w-full lg:max-w-72 lg:self-center'>
                <QrPicture render={render} />
            </div>
        </div>
    );
};
