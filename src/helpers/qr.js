import { DEFAULT_STYLE, normalizeStyle } from '@/engine/style';
import { getContentType, mergeValues } from '@/content-types';
import { randomCardColor } from '@/style-options';

export const getQrLink = id => `${window.location.origin}/q/${id}`;

export const createDraft = () => ({
    type: 'url',
    content: getContentType('url').initial(),
    style: DEFAULT_STYLE,
    cardColor: randomCardColor(),
    title: '',
});

export const qrToDraft = qr => {
    const type = getContentType(qr.type);
    return {
        type: type.id,
        content: mergeValues(type, qr.content),
        style: normalizeStyle(qr.style),
        cardColor: qr.card_color,
        title: qr.title,
    };
};

export const getQrTitle = (qr, t) => {
    if (qr.title?.trim()) return qr.title.trim();
    const type = getContentType(qr.type);
    return type.suggestTitle(mergeValues(type, qr.content)) || t('card.untitled');
};

export const resolveTitle = (draft, t) => {
    if (draft.title.trim()) return draft.title.trim();
    const type = getContentType(draft.type);
    return type.suggestTitle(mergeValues(type, draft.content)) || t(`types.${type.id}.label`);
};

export const getSummaryLines = (qr, t) => {
    const type = getContentType(qr.type);
    return type.summary(mergeValues(type, qr.content)).map(line => ({
        key: line.key,
        label: t(`types.${type.id}.fields.${line.key}`),
        value: line.option ? t(`types.${type.id}.options.${line.value}`) : line.value,
    }));
};

export const isOwner = (qr, user) => !!user?.id && qr.profile_id === user.id;

export const toFilename = title =>
    title
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'qr-code';
