import { Phone } from 'lucide-react';

const PHONE = /^\+?[0-9()\-.\s]{5,}$/;

export const phone = {
    id: 'phone',
    icon: Phone,
    initial: () => ({ phone: '' }),
    fields: [{ key: 'phone', control: 'text', type: 'tel', inputMode: 'tel', placeholder: '+1 555 123 4567' }],
    encode: values => `tel:${values.phone.replace(/[\s()\-.]/g, '')}`,
    validate: values => {
        if (!values.phone.trim()) return { phone: 'required' };
        return PHONE.test(values.phone.trim()) ? {} : { phone: 'invalid' };
    },
    summary: values => [{ key: 'phone', value: values.phone.trim() }],
    suggestTitle: values => values.phone.trim(),
};
