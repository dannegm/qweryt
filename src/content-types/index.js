import { email } from './email';
import { event } from './event';
import { geo } from './geo';
import { phone } from './phone';
import { sms } from './sms';
import { text } from './text';
import { url } from './url';
import { vcard } from './vcard';
import { wifi } from './wifi';

export const CONTENT_TYPES = [url, text, wifi, vcard, email, phone, sms, geo, event];

export const getContentType = id => CONTENT_TYPES.find(type => type.id === id) ?? text;

export const mergeValues = (type, values) => ({ ...type.initial(), ...(values ?? {}) });

export const updateValues = (type, values, patch) =>
    type.update ? type.update(values, patch) : { ...values, ...patch };

export const encodeContent = (typeId, values) => {
    const type = getContentType(typeId);
    return type.encode(mergeValues(type, values));
};

export const isContentValid = (typeId, values) => {
    const type = getContentType(typeId);
    return Object.keys(type.validate(mergeValues(type, values))).length === 0;
};

export const getContentIssues = (typeId, values) => {
    const type = getContentType(typeId);
    return type.validate(mergeValues(type, values));
};

export const isContentPreviewable = (typeId, values) =>
    Object.values(getContentIssues(typeId, values)).every(code => code === 'pending');
