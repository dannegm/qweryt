export const trim = (str, trimStr = ' ') => {
    const escapedTrimStr = trimStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^(${escapedTrimStr})+|(${escapedTrimStr})+$`, 'g');
    return str.replace(regex, '');
};

const COMBINING_MARK_RANGE = [0x0300, 0x036f];

export const normalizeText = str =>
    Array.from(str.normalize('NFD'))
        .filter(char => {
            const code = char.codePointAt(0);
            return code < COMBINING_MARK_RANGE[0] || code > COMBINING_MARK_RANGE[1];
        })
        .join('')
        .toLowerCase();
