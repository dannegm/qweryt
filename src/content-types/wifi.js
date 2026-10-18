import { Wifi } from 'lucide-react';

const escape = value => value.replace(/([\;,:"])/g, '\\$1');

export const wifi = {
    id: 'wifi',
    icon: Wifi,
    initial: () => ({ ssid: '', password: '', security: 'WPA', hidden: false }),
    fields: [
        { key: 'ssid', control: 'text', autoComplete: 'off' },
        {
            key: 'security',
            control: 'options',
            options: ['WPA', 'WEP', 'nopass'],
        },
        {
            key: 'password',
            control: 'text',
            autoComplete: 'off',
            visible: values => values.security !== 'nopass',
        },
        { key: 'hidden', control: 'switch' },
    ],
    encode: values => {
        const open = values.security === 'nopass';
        const parts = [
            `T:${open ? 'nopass' : values.security}`,
            `S:${escape(values.ssid)}`,
            ...(open ? [] : [`P:${escape(values.password)}`]),
            ...(values.hidden ? ['H:true'] : []),
        ];
        return `WIFI:${parts.join(';')};;`;
    },
    validate: values => {
        const errors = {};
        if (!values.ssid.trim()) errors.ssid = 'required';
        if (values.security !== 'nopass' && !values.password) errors.password = 'required';
        return errors;
    },
    summary: values => [
        { key: 'ssid', value: values.ssid },
        { key: 'security', value: values.security, option: true },
        ...(values.security !== 'nopass' ? [{ key: 'password', value: values.password }] : []),
    ],
    suggestTitle: values => values.ssid,
};
