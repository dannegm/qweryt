import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldRenderer } from '@/components/editor/field-renderer';
import { Label } from '@/ui/label';
import { CONTENT_TYPES, getContentIssues, getContentType, mergeValues } from '@/content-types';
import { cn } from '@/helpers/utils';

const TypePicker = ({ value, onChange }) => {
    const { t } = useTranslation();

    return (
        <div className='grid grid-cols-3 gap-2 sm:grid-cols-5'>
            {CONTENT_TYPES.map(type => {
                const Icon = type.icon;
                const selected = type.id === value;
                return (
                    <button
                        key={type.id}
                        type='button'
                        aria-pressed={selected}
                        onClick={() => onChange(type.id)}
                        className={cn(
                            'flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium transition-colors [&>svg]:size-5',
                            {
                                'border-primary bg-primary text-primary-foreground': selected,
                                'border-border bg-card hover:bg-muted': !selected,
                            },
                        )}
                    >
                        <Icon />
                        {t(`types.${type.id}.label`)}
                    </button>
                );
            })}
        </div>
    );
};

export const ContentTab = ({ typeId, content, onTypeChange, onContentChange }) => {
    const { t } = useTranslation();
    const type = getContentType(typeId);
    const [touched, setTouched] = useState(() => new Set());
    const values = useMemo(() => mergeValues(type, content), [type, content]);
    const issues = useMemo(() => getContentIssues(typeId, content), [typeId, content]);
    const required = useMemo(() => getContentIssues(typeId, type.initial()), [typeId, type]);

    const handleTypeChange = next => {
        setTouched(new Set());
        onTypeChange(next);
    };

    const handleBlur = key => setTouched(current => new Set(current).add(key));

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-2.5'>
                <Label>{t('editor.type')}</Label>
                <TypePicker value={typeId} onChange={handleTypeChange} />
            </div>
            <div className='flex flex-col gap-4'>
                {type.fields
                    .filter(field => field.visible?.(values) ?? true)
                    .map(field => (
                        <FieldRenderer
                            key={`${type.id}.${field.key}`}
                            type={type}
                            field={field}
                            values={values}
                            error={touched.has(field.key) || issues[field.key] === 'invalid' ? issues[field.key] : null}
                            required={required[field.key] === 'required'}
                            onChange={onContentChange}
                            onBlur={handleBlur}
                        />
                    ))}
            </div>
        </div>
    );
};
