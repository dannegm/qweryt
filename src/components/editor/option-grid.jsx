import { memo, useMemo } from 'react';
import { renderQr, toDataUrl } from '@/engine/render';
import { cn } from '@/helpers/utils';
import { writeOption } from '@/style-options';

const PREVIEW_TEXT = 'qweryt';

export const OptionChips = ({ options, value, onChange, getLabel }) => (
    <div className='flex flex-wrap gap-2'>
        {options.map(option => (
            <button
                key={option}
                type='button'
                aria-pressed={option === value}
                onClick={() => onChange(option)}
                className={cn('h-10 rounded-full border px-4 text-sm font-medium transition-colors', {
                    'border-primary bg-primary text-primary-foreground': option === value,
                    'border-border bg-card hover:bg-muted': option !== value,
                })}
            >
                {getLabel(option)}
            </button>
        ))}
    </div>
);

const PreviewCell = memo(({ definition, style, option, selected, label, onSelect }) => {
    const url = useMemo(() => {
        const sample = {
            ...writeOption(definition, style, option),
            logo: null,
            bgTransparent: false,
            margin: 1,
            ecc: 'M',
        };
        const result = renderQr(PREVIEW_TEXT, sample);
        return result.ok ? toDataUrl(result.svg) : null;
    }, [definition, style, option]);

    return (
        <button
            type='button'
            title={label}
            aria-label={label}
            aria-pressed={selected}
            onClick={() => onSelect(option)}
            className={cn('aspect-square overflow-hidden rounded-xl border-2 bg-card p-1 transition-colors', {
                'border-primary': selected,
                'border-border hover:border-primary/40': !selected,
            })}
        >
            {url && <img src={url} alt='' draggable={false} className='size-full object-contain' />}
        </button>
    );
});

export const OptionPreviews = ({ definition, style, value, onChange, getLabel }) => (
    <div className='grid grid-cols-4 gap-2'>
        {definition.options.map(option => (
            <PreviewCell
                key={option}
                definition={definition}
                style={style}
                option={option}
                selected={option === value}
                label={getLabel(option)}
                onSelect={onChange}
            />
        ))}
    </div>
);
