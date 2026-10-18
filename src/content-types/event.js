import { CalendarDays } from 'lucide-react';

const escape = value =>
    value
        .replace(/\\/g, '\\\\')
        .replace(/\r?\n/g, '\\n')
        .replace(/([,;])/g, '\\$1');

const compact = (value, allDay) => {
    const digits = value.replace(/[-:]/g, '');
    return allDay ? digits.slice(0, 8) : `${digits.slice(0, 13).padEnd(13, '0')}00`;
};

export const event = {
    id: 'event',
    icon: CalendarDays,
    initial: () => ({ title: '', location: '', description: '', allDay: false, start: '', end: '' }),
    fields: [
        { key: 'title', control: 'text', autoComplete: 'off' },
        { key: 'location', control: 'text', autoComplete: 'off' },
        { key: 'allDay', control: 'switch' },
        { key: 'start', control: 'datetime' },
        { key: 'end', control: 'datetime' },
        { key: 'description', control: 'textarea', maxLength: 500 },
    ],
    update: (values, patch) => {
        const next = { ...values, ...patch };
        if ('allDay' in patch && patch.allDay !== values.allDay) {
            ['start', 'end'].forEach(key => {
                const current = next[key];
                if (!current) return;
                next[key] = patch.allDay ? current.slice(0, 10) : `${current.slice(0, 10)}T09:00`;
            });
        }
        return next;
    },
    encode: values => {
        const start = values.allDay ? `DTSTART;VALUE=DATE:${compact(values.start, true)}` : `DTSTART:${compact(values.start, false)}`;
        const end = values.end
            ? values.allDay
                ? `DTEND;VALUE=DATE:${compact(values.end, true)}`
                : `DTEND:${compact(values.end, false)}`
            : '';
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `SUMMARY:${escape(values.title.trim())}`,
            start,
            end,
            values.location.trim() && `LOCATION:${escape(values.location.trim())}`,
            values.description.trim() && `DESCRIPTION:${escape(values.description.trim())}`,
            'END:VEVENT',
            'END:VCALENDAR',
        ]
            .filter(Boolean)
            .join('\n');
    },
    validate: values => {
        const errors = {};
        if (!values.title.trim()) errors.title = 'required';
        if (!values.start) errors.start = 'required';
        if (values.start && values.end && values.end < values.start) errors.end = 'invalid';
        return errors;
    },
    summary: values =>
        [
            { key: 'title', value: values.title.trim() },
            { key: 'start', value: values.start.replace('T', ' ') },
            { key: 'location', value: values.location.trim() },
        ].filter(line => line.value),
    suggestTitle: values => values.title.trim(),
};
