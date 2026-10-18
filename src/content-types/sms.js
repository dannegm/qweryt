import { MessageSquare } from 'lucide-react';

const PHONE = /^\+?[0-9()\-.\s]{5,}$/;

export const sms = {
    id: 'sms',
    icon: MessageSquare,
    initial: () => ({ phone: '', message: '' }),
    fields: [
        { key: 'phone', control: 'text', type: 'tel', inputMode: 'tel', placeholder: '+1 555 123 4567' },
        { key: 'message', control: 'textarea', maxLength: 400 },
    ],
    encode: values => {
        const number = values.phone.replace(/[\s()\-.]/g, '');
        const message = values.message.trim();
        return `sms:${number}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
    },
    validate: values => {
        if (!values.phone.trim()) return { phone: 'required' };
        return PHONE.test(values.phone.trim()) ? {} : { phone: 'invalid' };
    },
    summary: values =>
        [
            { key: 'phone', value: values.phone.trim() },
            { key: 'message', value: values.message.trim() },
        ].filter(line => line.value),
    suggestTitle: values => values.phone.trim(),
};
