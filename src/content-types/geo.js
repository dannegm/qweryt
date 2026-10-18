import { MapPin } from 'lucide-react';

const inRange = (value, limit) => {
    const number = Number(value);
    return value.trim() !== '' && Number.isFinite(number) && Math.abs(number) <= limit;
};

export const geo = {
    id: 'geo',
    icon: MapPin,
    initial: () => ({ lat: '', lng: '' }),
    fields: [
        { key: 'lat', control: 'text', inputMode: 'decimal', placeholder: '20.6597' },
        { key: 'lng', control: 'text', inputMode: 'decimal', placeholder: '-103.3496' },
    ],
    encode: values => `geo:${Number(values.lat)},${Number(values.lng)}`,
    validate: values => {
        const errors = {};
        if (!values.lat.trim()) errors.lat = 'required';
        else if (!inRange(values.lat, 90)) errors.lat = 'invalid';
        if (!values.lng.trim()) errors.lng = 'required';
        else if (!inRange(values.lng, 180)) errors.lng = 'invalid';
        return errors;
    },
    summary: values => [
        { key: 'lat', value: values.lat.trim() },
        { key: 'lng', value: values.lng.trim() },
    ],
    suggestTitle: values => `${values.lat.trim()}, ${values.lng.trim()}`,
};
