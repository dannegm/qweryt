import { useTranslation } from 'react-i18next';
import { ColorField } from '@/components/editor/color-field';
import { LogoUpload } from '@/components/editor/logo-upload';
import { OptionChips, OptionPreviews } from '@/components/editor/option-grid';
import { Label } from '@/ui/label';
import { Slider } from '@/ui/slider';
import { Switch } from '@/ui/switch';
import { readOption, writeOption } from '@/style-options';

const SliderControl = ({ option, label, value, onChange }) => (
    <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
            <Label>{label}</Label>
            <span className='font-mono text-xs text-muted-foreground'>{option.format(value)}</span>
        </div>
        <Slider
            value={[value]}
            min={option.min}
            max={option.max}
            step={option.step}
            onValueChange={next => onChange(Array.isArray(next) ? next[0] : next)}
        />
    </div>
);

const SwitchControl = ({ label, value, onChange }) => (
    <div className='flex items-center justify-between gap-3'>
        <Label>{label}</Label>
        <Switch checked={!!value} onCheckedChange={onChange} />
    </div>
);

const OptionsControl = ({ option, label, value, style, onChange }) => {
    const { t } = useTranslation();
    const getLabel = item => t(`style.${option.key}.options.${item}`);
    const hint = t(`style.${option.key}.hint`, { defaultValue: '' });

    return (
        <div className='flex flex-col gap-2.5'>
            <Label>{label}</Label>
            {option.preview ? (
                <OptionPreviews
                    definition={option}
                    style={style}
                    value={value}
                    onChange={onChange}
                    getLabel={getLabel}
                />
            ) : (
                <OptionChips options={option.options} value={value} onChange={onChange} getLabel={getLabel} />
            )}
            {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
        </div>
    );
};

export const StyleControl = ({ option, style, onChange }) => {
    const { t } = useTranslation();
    const label = t(`style.${option.key}.label`);
    const value = readOption(option, style);
    const set = next => onChange(current => writeOption(option, current, next));

    if (option.control === 'logo-upload') {
        return (
            <div className='flex flex-col gap-2.5'>
                <Label>{label}</Label>
                <LogoUpload logo={style.logo} onChange={onChange} />
            </div>
        );
    }
    if (option.control === 'slider') {
        return <SliderControl option={option} label={label} value={value} onChange={set} />;
    }
    if (option.control === 'color') return <ColorField label={label} value={value} onChange={set} />;
    if (option.control === 'switch') return <SwitchControl label={label} value={value} onChange={set} />;
    return <OptionsControl option={option} label={label} value={value} style={style} onChange={set} />;
};
