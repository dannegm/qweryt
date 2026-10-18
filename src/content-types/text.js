import { Type } from 'lucide-react';

export const text = {
    id: 'text',
    icon: Type,
    initial: () => ({ text: '' }),
    fields: [{ key: 'text', control: 'textarea', maxLength: 1200 }],
    encode: values => values.text,
    validate: values => (values.text.trim() ? {} : { text: 'required' }),
    summary: values => [{ key: 'text', value: values.text.trim() }],
    suggestTitle: values => values.text.trim().split('\n')[0].slice(0, 28),
};
