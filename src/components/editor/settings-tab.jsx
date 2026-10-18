import { useTranslation } from 'react-i18next';
import { Palette } from 'lucide-react';
import { ExportButtons } from '@/components/editor/export-buttons';
import { ColorPicker } from '@/ui/color-picker';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { CARD_COLORS } from '@/constants/card-colors';
import { cn } from '@/helpers/utils';
import { toFilename } from '@/helpers/qr';

const CardColorPicker = ({ value, onChange }) => {
    const { t } = useTranslation();
    const isCustom = !CARD_COLORS.includes(value);

    return (
        <div className='flex flex-wrap gap-2.5'>
            {CARD_COLORS.map(color => (
                <button
                    key={color}
                    type='button'
                    aria-label={color}
                    aria-pressed={color === value}
                    onClick={() => onChange(color)}
                    className={cn('size-10 rounded-full bg-(--swatch) ring-offset-2 ring-offset-background transition-shadow', {
                        'ring-2 ring-foreground': color === value,
                    })}
                    style={{ '--swatch': color }}
                />
            ))}
            <ColorPicker value={value} onChange={onChange} title={t('editor.customColor')}>
                <button
                    type='button'
                    aria-label={t('editor.customColor')}
                    className={cn(
                        'flex-center size-10 rounded-full border border-border bg-(--swatch) text-white ring-offset-2 ring-offset-background [&>svg]:size-4',
                        { 'ring-2 ring-foreground': isCustom },
                    )}
                    style={{ '--swatch': isCustom ? value : 'var(--card)' }}
                >
                    <Palette className={isCustom ? 'text-white' : 'text-foreground'} />
                </button>
            </ColorPicker>
        </div>
    );
};

export const SettingsTab = ({ draft, render, resolvedTitle, onTitleChange, onCardColorChange }) => {
    const { t } = useTranslation();
    const canExport = render.ok && !render.sample;

    return (
        <div className='flex flex-col gap-8'>
            <section className='flex flex-col gap-1.5'>
                <Label>{t('editor.titleLabel')}</Label>
                <Input
                    value={draft.title}
                    maxLength={60}
                    placeholder={t('editor.titlePlaceholder')}
                    onChange={event => onTitleChange(event.target.value)}
                    className='h-11 bg-card'
                />
                <p className='text-xs text-muted-foreground'>{t('editor.titleHint')}</p>
            </section>
            <section className='flex flex-col gap-2.5'>
                <Label>{t('editor.cardColor')}</Label>
                <CardColorPicker value={draft.cardColor} onChange={onCardColorChange} />
            </section>
            <section className='flex flex-col gap-2.5'>
                <Label>{t('editor.exportTitle')}</Label>
                <ExportButtons svg={render.svg} filename={toFilename(resolvedTitle)} disabled={!canExport} />
                <p className='text-xs text-muted-foreground'>
                    {t('editor.exportHint')} {t('editor.unsavedExport')}
                </p>
            </section>
        </div>
    );
};
