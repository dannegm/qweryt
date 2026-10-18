export const STYLE_VERSION = 1;

export const PIXEL_SHAPES = ['square', 'rounded', 'liquid', 'dots', 'diamond', 'star', 'bars-v', 'bars-h'];
export const EYE_FRAME_SHAPES = ['square', 'rounded', 'circle', 'leaf'];
export const EYE_BALL_SHAPES = ['square', 'rounded', 'circle', 'leaf', 'diamond'];
export const FILL_MODES = ['solid', 'linear', 'radial'];
export const EYE_COLOR_MODES = ['same', 'custom'];
export const ECC_LEVELS = ['auto', 'L', 'M', 'Q', 'H'];
export const LOGO_SHAPES = ['square', 'rounded', 'circle'];

export const RANGES = {
    pixelScale: { min: 0.5, max: 1, step: 0.05 },
    fgAngle: { min: 0, max: 360, step: 15 },
    bgRadius: { min: 0, max: 30, step: 1 },
    margin: { min: 0, max: 8, step: 1 },
    logoSize: { min: 0.1, max: 0.35, step: 0.01 },
    logoPadding: { min: 0, max: 0.3, step: 0.01 },
};

export const DEFAULT_LOGO = {
    src: null,
    size: 0.2,
    padding: 0.08,
    shape: 'rounded',
    bg: null,
    hideDots: true,
};

export const DEFAULT_STYLE = {
    v: STYLE_VERSION,
    pixel: 'square',
    pixelScale: 1,
    fgMode: 'solid',
    fg: '#111827',
    fg2: '#4f46e5',
    fgAngle: 45,
    bg: '#ffffff',
    bgTransparent: false,
    bgRadius: 0,
    eyeFrame: 'square',
    eyeBall: 'square',
    eyeColorMode: 'same',
    eyeFrameColor: '#111827',
    eyeBallColor: '#111827',
    margin: 3,
    ecc: 'auto',
    logo: null,
};

const LOGO_SRC = /^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
const LOGO_MAX_LENGTH = 140000;

const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
};

const pick = (list, value, fallback) => (list.includes(value) ? value : fallback);

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const toHex = (value, fallback) => {
    if (typeof value !== 'string' || !HEX.test(value)) return fallback;
    if (value.length === 4) {
        const [, r, g, b] = value;
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return value.toLowerCase();
};

const normalizeLogo = raw => {
    if (!raw || typeof raw !== 'object') return null;
    const src = typeof raw.src === 'string' && raw.src.length <= LOGO_MAX_LENGTH && LOGO_SRC.test(raw.src) ? raw.src : null;
    if (!src) return null;
    const { logoSize, logoPadding } = RANGES;
    return {
        src,
        size: clamp(raw.size, logoSize.min, logoSize.max, DEFAULT_LOGO.size),
        padding: clamp(raw.padding, logoPadding.min, logoPadding.max, DEFAULT_LOGO.padding),
        shape: pick(LOGO_SHAPES, raw.shape, DEFAULT_LOGO.shape),
        bg: raw.bg ? toHex(raw.bg, null) : null,
        hideDots: raw.hideDots !== false,
    };
};

export const normalizeStyle = raw => {
    const source = raw && typeof raw === 'object' ? raw : {};
    const base = DEFAULT_STYLE;
    return {
        v: STYLE_VERSION,
        pixel: pick(PIXEL_SHAPES, source.pixel, base.pixel),
        pixelScale: clamp(source.pixelScale, RANGES.pixelScale.min, RANGES.pixelScale.max, base.pixelScale),
        fgMode: pick(FILL_MODES, source.fgMode, base.fgMode),
        fg: toHex(source.fg, base.fg),
        fg2: toHex(source.fg2, base.fg2),
        fgAngle: clamp(source.fgAngle, RANGES.fgAngle.min, RANGES.fgAngle.max, base.fgAngle),
        bg: toHex(source.bg, base.bg),
        bgTransparent: source.bgTransparent === true,
        bgRadius: clamp(source.bgRadius, RANGES.bgRadius.min, RANGES.bgRadius.max, base.bgRadius),
        eyeFrame: pick(EYE_FRAME_SHAPES, source.eyeFrame, base.eyeFrame),
        eyeBall: pick(EYE_BALL_SHAPES, source.eyeBall, base.eyeBall),
        eyeColorMode: pick(EYE_COLOR_MODES, source.eyeColorMode, base.eyeColorMode),
        eyeFrameColor: toHex(source.eyeFrameColor, base.eyeFrameColor),
        eyeBallColor: toHex(source.eyeBallColor, base.eyeBallColor),
        margin: Math.round(clamp(source.margin, RANGES.margin.min, RANGES.margin.max, base.margin)),
        ecc: pick(ECC_LEVELS, source.ecc, base.ecc),
        logo: normalizeLogo(source.logo),
    };
};

const channel = value => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
};

export const luminance = hex => {
    const value = toHex(hex, '#000000').slice(1);
    const [r, g, b] = [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16));
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const contrastRatio = (first, second) => {
    const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
};

export const getBackgroundColor = style => (style.bgTransparent ? '#ffffff' : style.bg);
