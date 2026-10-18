import { contrastRatio, getBackgroundColor, luminance } from './style';

const CAPACITY = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };

const getInkColors = style => [
    style.fg,
    ...(style.fgMode === 'solid' ? [] : [style.fg2]),
    ...(style.eyeColorMode === 'custom' ? [style.eyeFrameColor, style.eyeBallColor] : []),
];

export const getGuards = (style, stats) => {
    const guards = [];
    const background = getBackgroundColor(style);
    const lowest = Math.min(...getInkColors(style).map(color => contrastRatio(color, background)));

    if (lowest < 2) guards.push({ code: 'contrast-low', level: 'error', params: { ratio: lowest.toFixed(1) } });
    else if (lowest < 3.5) guards.push({ code: 'contrast-weak', level: 'warn', params: { ratio: lowest.toFixed(1) } });

    if (!style.bgTransparent && luminance(style.fg) > luminance(style.bg)) {
        guards.push({ code: 'inverted', level: 'warn' });
    }
    if (style.bgTransparent) guards.push({ code: 'transparent', level: 'info' });
    if (style.margin < 2) guards.push({ code: 'quiet-zone', level: 'warn' });
    if (style.pixel !== 'square' && style.pixel !== 'liquid' && style.pixelScale < 0.7) {
        guards.push({ code: 'small-pixels', level: 'warn' });
    }

    if (style.logo) {
        const capacity = CAPACITY[stats.ecc];
        if (stats.logoCoversEyes) guards.push({ code: 'logo-covers-eyes', level: 'error' });
        else if (stats.covered > capacity * 0.8) guards.push({ code: 'logo-too-big', level: 'error' });
        else if (stats.covered > capacity * 0.5) guards.push({ code: 'logo-big', level: 'warn' });
        if (stats.ecc !== 'H') guards.push({ code: 'logo-ecc', level: 'warn', params: { ecc: stats.ecc } });
    }

    return guards;
};
