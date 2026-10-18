import { Link } from 'lucide-react';

export const ensureScheme = value => {
    const trimmed = value.trim();
    return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const parse = value => {
    try {
        return new URL(ensureScheme(value));
    } catch {
        return null;
    }
};

export const url = {
    id: 'url',
    icon: Link,
    initial: () => ({ url: '', shorten: false, short_url: null }),
    fields: [
        { key: 'url', control: 'text', type: 'url', inputMode: 'url', placeholder: 'example.com/page' },
        { key: 'shorten', control: 'shorten' },
    ],
    encode: values => (values.shorten && values.short_url ? values.short_url : ensureScheme(values.url)),
    validate: values => {
        if (!values.url.trim()) return { url: 'required' };
        const parsed = parse(values.url);
        const hasHost = parsed && (parsed.hostname.includes('.') || parsed.hostname === 'localhost');
        if (!parsed || (/^https?:$/.test(parsed.protocol) && !hasHost)) return { url: 'invalid' };
        if (values.shorten && !values.short_url) return { short_url: 'pending' };
        return {};
    },
    update: (values, patch) => {
        const next = { ...values, ...patch };
        if ('url' in patch && patch.url !== values.url) next.short_url = null;
        if (!next.shorten) next.short_url = null;
        return next;
    },
    summary: values => [
        { key: 'url', value: values.url.trim() },
        ...(values.shorten && values.short_url ? [{ key: 'short_url', value: values.short_url }] : []),
    ],
    suggestTitle: values => parse(values.url)?.hostname.replace(/^www\./, '') ?? '',
};
