import {
    DEFAULT_LOGO,
    ECC_LEVELS,
    EYE_BALL_SHAPES,
    EYE_COLOR_MODES,
    EYE_FRAME_SHAPES,
    FILL_MODES,
    LOGO_SHAPES,
    PIXEL_SHAPES,
    RANGES,
    contrastRatio,
} from '@/engine/style';
import { CARD_COLORS } from '@/constants/card-colors';
import { hslToHex } from '@/helpers/colors';

export const STYLE_GROUPS = ['pixels', 'eyes', 'colors', 'background', 'logo', 'advanced'];

const percent = value => `${Math.round(value * 100)}%`;
const degrees = value => `${Math.round(value)}°`;
const plain = value => `${value}`;

const pick = list => list[Math.floor(Math.random() * list.length)];
const between = (min, max) => min + Math.random() * (max - min);

export const STYLE_OPTIONS = [
    { key: 'pixel', group: 'pixels', control: 'options', options: PIXEL_SHAPES, preview: true },
    { key: 'pixelScale', group: 'pixels', control: 'slider', ...RANGES.pixelScale, format: percent },

    { key: 'eyeFrame', group: 'eyes', control: 'options', options: EYE_FRAME_SHAPES, preview: true },
    { key: 'eyeBall', group: 'eyes', control: 'options', options: EYE_BALL_SHAPES, preview: true },
    { key: 'eyeColorMode', group: 'eyes', control: 'options', options: EYE_COLOR_MODES },
    { key: 'eyeFrameColor', group: 'eyes', control: 'color', visible: style => style.eyeColorMode === 'custom' },
    { key: 'eyeBallColor', group: 'eyes', control: 'color', visible: style => style.eyeColorMode === 'custom' },

    { key: 'fgMode', group: 'colors', control: 'options', options: FILL_MODES },
    { key: 'fg', group: 'colors', control: 'color' },
    { key: 'fg2', group: 'colors', control: 'color', visible: style => style.fgMode !== 'solid' },
    {
        key: 'fgAngle',
        group: 'colors',
        control: 'slider',
        ...RANGES.fgAngle,
        format: degrees,
        visible: style => style.fgMode === 'linear',
    },

    { key: 'bgTransparent', group: 'background', control: 'switch' },
    { key: 'bg', group: 'background', control: 'color', visible: style => !style.bgTransparent },
    { key: 'bgRadius', group: 'background', control: 'slider', ...RANGES.bgRadius, format: plain },

    { key: 'logo', group: 'logo', control: 'logo-upload' },
    {
        key: 'logoSize',
        path: ['logo', 'size'],
        group: 'logo',
        control: 'slider',
        ...RANGES.logoSize,
        format: percent,
        visible: style => !!style.logo,
    },
    {
        key: 'logoPadding',
        path: ['logo', 'padding'],
        group: 'logo',
        control: 'slider',
        ...RANGES.logoPadding,
        format: percent,
        visible: style => !!style.logo,
    },
    {
        key: 'logoShape',
        path: ['logo', 'shape'],
        group: 'logo',
        control: 'options',
        options: LOGO_SHAPES,
        visible: style => !!style.logo,
    },
    {
        key: 'logoBg',
        path: ['logo', 'bg'],
        group: 'logo',
        control: 'color',
        fallback: style => (style.bgTransparent ? '#ffffff' : style.bg),
        visible: style => !!style.logo,
    },
    {
        key: 'logoHideDots',
        path: ['logo', 'hideDots'],
        group: 'logo',
        control: 'switch',
        visible: style => !!style.logo,
    },

    { key: 'margin', group: 'advanced', control: 'slider', ...RANGES.margin, format: plain },
    { key: 'ecc', group: 'advanced', control: 'options', options: ECC_LEVELS },
];

export const readOption = (option, style) => {
    const path = option.path ?? [option.key];
    const value = path.reduce((node, key) => node?.[key], style);
    return value ?? option.fallback?.(style) ?? null;
};

export const writeOption = (option, style, value) => {
    const path = option.path ?? [option.key];
    if (path.length === 1) return { ...style, [path[0]]: value };
    const [root, leaf] = path;
    return { ...style, [root]: { ...style[root], [leaf]: value } };
};

export const attachLogo = (style, src) => ({ ...style, logo: { ...DEFAULT_LOGO, ...style.logo, src } });

export const removeLogo = style => ({ ...style, logo: null });

const randomPalette = () => {
    const hue = Math.floor(between(0, 360));
    const background = Math.random() < 0.5 ? '#ffffff' : hslToHex(hue, between(15, 60), between(94, 98));
    for (let attempt = 0; attempt < 20; attempt++) {
        const fg = hslToHex(hue, between(45, 90), between(10, 32));
        const fg2 = hslToHex((hue + between(30, 150)) % 360, between(60, 90), between(26, 42));
        if (contrastRatio(fg, background) >= 5 && contrastRatio(fg2, background) >= 4.5) {
            return { fg, fg2, bg: background };
        }
    }
    return { fg: '#111827', fg2: '#4f46e5', bg: '#ffffff' };
};

export const randomizeStyle = style => {
    const palette = randomPalette();
    const customEyes = Math.random() < 0.4;
    const eyeInk = hslToHex(Math.floor(between(0, 360)), between(55, 90), between(14, 34));
    const eyeInk2 = Math.random() < 0.5 ? eyeInk : palette.fg;
    return {
        ...style,
        ...palette,
        pixel: pick(PIXEL_SHAPES),
        pixelScale: pick([0.75, 0.85, 0.95, 1]),
        fgMode: pick(FILL_MODES),
        fgAngle: pick([0, 45, 90, 135, 180]),
        bgTransparent: false,
        bgRadius: pick([0, 0, 6, 12, 20]),
        eyeFrame: pick(EYE_FRAME_SHAPES),
        eyeBall: pick(EYE_BALL_SHAPES),
        eyeColorMode: customEyes ? 'custom' : 'same',
        eyeFrameColor: eyeInk,
        eyeBallColor: eyeInk2,
        margin: pick([2, 3, 4]),
    };
};

export const randomCardColor = () => pick(CARD_COLORS);
