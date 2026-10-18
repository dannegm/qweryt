const SHARE_PARAM = 'share';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64Url = bytes =>
    btoa(String.fromCharCode(...bytes))
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');

const fromBase64Url = text => {
    const padded = text.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
    return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
};

const extractPayload = rawLink => {
    const hash = rawLink.includes('#') ? rawLink.slice(rawLink.indexOf('#') + 1) : rawLink;
    return new URLSearchParams(hash).get(SHARE_PARAM);
};

export const createShareLink = data =>
    `${window.location.origin}/settings#${SHARE_PARAM}=${toBase64Url(encoder.encode(JSON.stringify(data)))}`;

export const readShareLink = (link, invalidMessage) => {
    try {
        const payload = extractPayload(link);
        if (!payload) throw new Error();
        return JSON.parse(decoder.decode(fromBase64Url(payload)));
    } catch {
        throw new Error(invalidMessage);
    }
};

export const getShareHash = () => (window.location.hash.includes(`${SHARE_PARAM}=`) ? window.location.href : '');

export const clearShareHash = () =>
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
