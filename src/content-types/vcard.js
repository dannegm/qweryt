import { Contact } from 'lucide-react';

const escape = value =>
    value
        .replace(/\\/g, '\\\\')
        .replace(/\r?\n/g, '\\n')
        .replace(/([,;])/g, '\\$1');

const fullName = values => [values.firstName, values.lastName].map(part => part.trim()).filter(Boolean).join(' ');

export const vcard = {
    id: 'vcard',
    icon: Contact,
    initial: () => ({
        firstName: '',
        lastName: '',
        org: '',
        jobTitle: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        note: '',
    }),
    fields: [
        { key: 'firstName', control: 'text', autoComplete: 'off' },
        { key: 'lastName', control: 'text', autoComplete: 'off' },
        { key: 'org', control: 'text', autoComplete: 'off' },
        { key: 'jobTitle', control: 'text', autoComplete: 'off' },
        { key: 'phone', control: 'text', type: 'tel', inputMode: 'tel' },
        { key: 'email', control: 'text', type: 'email', inputMode: 'email' },
        { key: 'website', control: 'text', type: 'url', inputMode: 'url' },
        { key: 'address', control: 'text', autoComplete: 'off' },
        { key: 'note', control: 'textarea', maxLength: 400 },
    ],
    encode: values =>
        [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `N:${escape(values.lastName.trim())};${escape(values.firstName.trim())};;;`,
            `FN:${escape(fullName(values))}`,
            values.org.trim() && `ORG:${escape(values.org.trim())}`,
            values.jobTitle.trim() && `TITLE:${escape(values.jobTitle.trim())}`,
            values.phone.trim() && `TEL;TYPE=CELL:${escape(values.phone.trim())}`,
            values.email.trim() && `EMAIL:${escape(values.email.trim())}`,
            values.website.trim() && `URL:${values.website.trim()}`,
            values.address.trim() && `ADR;TYPE=WORK:;;${escape(values.address.trim())};;;;`,
            values.note.trim() && `NOTE:${escape(values.note.trim())}`,
            'END:VCARD',
        ]
            .filter(Boolean)
            .join('\n'),
    validate: values => {
        const hasName = values.firstName.trim() || values.lastName.trim();
        return hasName ? {} : { firstName: 'required' };
    },
    summary: values =>
        [
            { key: 'name', value: fullName(values) },
            { key: 'org', value: values.org.trim() },
            { key: 'phone', value: values.phone.trim() },
            { key: 'email', value: values.email.trim() },
        ].filter(line => line.value),
    suggestTitle: values => fullName(values),
};
