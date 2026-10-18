import { Mail } from 'lucide-react';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const email = {
    id: 'email',
    icon: Mail,
    initial: () => ({ to: '', subject: '', body: '' }),
    fields: [
        { key: 'to', control: 'text', type: 'email', inputMode: 'email', autoComplete: 'off' },
        { key: 'subject', control: 'text', autoComplete: 'off' },
        { key: 'body', control: 'textarea', maxLength: 600 },
    ],
    encode: values => {
        const query = [
            values.subject.trim() && `subject=${encodeURIComponent(values.subject.trim())}`,
            values.body.trim() && `body=${encodeURIComponent(values.body.trim())}`,
        ].filter(Boolean);
        return `mailto:${values.to.trim()}${query.length ? `?${query.join('&')}` : ''}`;
    },
    validate: values => {
        if (!values.to.trim()) return { to: 'required' };
        return EMAIL.test(values.to.trim()) ? {} : { to: 'invalid' };
    },
    summary: values =>
        [
            { key: 'to', value: values.to.trim() },
            { key: 'subject', value: values.subject.trim() },
        ].filter(line => line.value),
    suggestTitle: values => values.to.trim(),
};
