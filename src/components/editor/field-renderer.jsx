import { useTranslation } from 'react-i18next';
import { OptionChips } from '@/components/editor/option-grid';
import { ShortenField } from '@/components/editor/shorten-field';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';
import { Textarea } from '@/ui/textarea';

const FieldShell = ({ label, required, error, children }) => (
    <div className='flex flex-col gap-1.5'>
        <Label>
            {label}
            {required && <span className='text-destructive'>*</span>}
        </Label>
        {children}
        {error && <p className='text-xs text-destructive'>{error}</p>}
    </div>
);

export const FieldRenderer = ({ type, field, values, error, required, onChange, onBlur }) => {
    const { t } = useTranslation();
    const label = t(`types.${type.id}.fields.${field.key}`);
    const value = values[field.key];
    const invalid = !!error;
    const errorText = error && error !== 'pending' ? t(`common.${error}`) : null;
    const set = next => onChange({ [field.key]: next });

    if (field.control === 'shorten') return <ShortenField values={values} onChange={onChange} />;

    if (field.control === 'switch') {
        return (
            <div className='flex items-center justify-between gap-3'>
                <Label>{label}</Label>
                <Switch checked={!!value} onCheckedChange={set} />
            </div>
        );
    }

    if (field.control === 'options') {
        return (
            <FieldShell label={label}>
                <OptionChips
                    options={field.options}
                    value={value}
                    onChange={set}
                    getLabel={option => t(`types.${type.id}.options.${option}`)}
                />
            </FieldShell>
        );
    }

    if (field.control === 'textarea') {
        return (
            <FieldShell label={label} required={required} error={errorText}>
                <Textarea
                    value={value}
                    maxLength={field.maxLength}
                    aria-invalid={invalid}
                    onBlur={() => onBlur(field.key)}
                    onChange={event => set(event.target.value)}
                    className='min-h-24'
                />
            </FieldShell>
        );
    }

    return (
        <FieldShell label={label} required={required} error={errorText}>
            <Input
                type={field.control === 'datetime' ? (values.allDay ? 'date' : 'datetime-local') : (field.type ?? 'text')}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete ?? 'off'}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                value={value}
                aria-invalid={invalid}
                onBlur={() => onBlur(field.key)}
                onChange={event => set(event.target.value)}
                className='h-11'
            />
        </FieldShell>
    );
};
