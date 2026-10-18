import { buildMatrix } from './matrix';
import { getGuards } from './guards';
import { circle, eyeBallPath, eyeFramePath, modulePath, roundRect } from './shapes';
import { getBackgroundColor, normalizeStyle } from './style';

export const EXPORT_SIZE = 1024;

const f = number => +number.toFixed(3);

const getLevels = style => {
    if (style.ecc !== 'auto') return [style.ecc];
    return style.logo ? ['H', 'Q', 'M', 'L'] : ['M', 'L'];
};

const isEyeCell = (row, col, size) =>
    (row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7);

const getLogoLayout = (style, size) => {
    const { logo, margin } = style;
    if (!logo) return null;
    const side = logo.size * size;
    const box = side * (1 + logo.padding * 2);
    const center = margin + size / 2;
    return { side, box, center, shape: logo.shape };
};

const logoShapePath = (shape, center, side) => {
    const start = center - side / 2;
    if (shape === 'circle') return circle(center, center, side / 2);
    const radius = shape === 'rounded' ? side * 0.22 : 0;
    return roundRect(start, start, side, side, Array(4).fill(radius));
};

const isHiddenByLogo = (layout, row, col, margin) => {
    const dx = col + margin + 0.5 - layout.center;
    const dy = row + margin + 0.5 - layout.center;
    const reach = layout.box / 2 + 0.25;
    if (layout.shape === 'circle') return Math.hypot(dx, dy) <= reach;
    return Math.abs(dx) <= reach && Math.abs(dy) <= reach;
};

const coversEyes = (layout, size, margin) => {
    const low = layout.center - layout.box / 2;
    const high = layout.center + layout.box / 2;
    const zones = [
        [margin, margin + 8, margin, margin + 8],
        [margin + size - 8, margin + size, margin, margin + 8],
        [margin, margin + 8, margin + size - 8, margin + size],
    ];
    return zones.some(([x0, x1, y0, y1]) => low < x1 && high > x0 && low < y1 && high > y0);
};

const buildModules = (style, matrix, layout) => {
    const { modules, size } = matrix;
    const { pixel, pixelScale, margin } = style;
    const merge = pixel === 'square' && pixelScale === 1;
    const visible = (row, col) =>
        row >= 0 &&
        col >= 0 &&
        row < size &&
        col < size &&
        modules[row][col] === 1 &&
        !isEyeCell(row, col, size) &&
        !(layout && style.logo.hideDots && isHiddenByLogo(layout, row, col, margin));

    let path = '';
    let hidden = 0;

    for (let row = 0; row < size; row++) {
        let run = 0;
        for (let col = 0; col <= size; col++) {
            const on = col < size && visible(row, col);
            if (merge) {
                if (on) run++;
                else if (run) {
                    path += `M${col - run + margin} ${row + margin}h${run}v1h${-run}Z`;
                    run = 0;
                }
                continue;
            }
            if (!on) continue;
            const near = {
                u: visible(row - 1, col),
                d: visible(row + 1, col),
                l: visible(row, col - 1),
                r: visible(row, col + 1),
            };
            path += modulePath(pixel, col + margin, row + margin, pixelScale, near);
        }
    }

    if (layout && style.logo.hideDots) {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (modules[row][col] === 1 && !isEyeCell(row, col, size) && isHiddenByLogo(layout, row, col, margin)) {
                    hidden++;
                }
            }
        }
    }

    return { path, hidden };
};

const buildEyes = (style, size) => {
    const { margin } = style;
    const spots = [
        [margin, margin, 0],
        [margin + size - 7, margin, 1],
        [margin, margin + size - 7, 3],
    ];
    return {
        frames: spots.map(([x, y, sharp]) => eyeFramePath(style.eyeFrame, x, y, sharp)).join(''),
        balls: spots.map(([x, y, sharp]) => eyeBallPath(style.eyeBall, x, y, sharp)).join(''),
    };
};

const buildGradient = (style, total) => {
    if (style.fgMode === 'solid') return '';
    const stops = `<stop offset="0" stop-color="${style.fg}"/><stop offset="1" stop-color="${style.fg2}"/>`;
    const half = total / 2;
    if (style.fgMode === 'radial') {
        return `<radialGradient id="qf" gradientUnits="userSpaceOnUse" cx="${f(half)}" cy="${f(half)}" r="${f(total * 0.62)}">${stops}</radialGradient>`;
    }
    const radians = (style.fgAngle * Math.PI) / 180;
    const dx = Math.cos(radians) * half;
    const dy = Math.sin(radians) * half;
    return `<linearGradient id="qf" gradientUnits="userSpaceOnUse" x1="${f(half - dx)}" y1="${f(half - dy)}" x2="${f(half + dx)}" y2="${f(half + dy)}">${stops}</linearGradient>`;
};

const buildLogo = (style, layout) => {
    if (!layout) return { defs: '', body: '' };
    const { logo } = style;
    const backing = logo.bg ?? getBackgroundColor(style);
    const start = layout.center - layout.side / 2;
    return {
        defs: `<clipPath id="ql"><path d="${logoShapePath(layout.shape, layout.center, layout.side)}"/></clipPath>`,
        body: `<path d="${logoShapePath(layout.shape, layout.center, layout.box)}" fill="${backing}"/><g clip-path="url(#ql)"><image href="${logo.src}" x="${f(start)}" y="${f(start)}" width="${f(layout.side)}" height="${f(layout.side)}" preserveAspectRatio="xMidYMid meet"/></g>`,
    };
};

const getCovered = (layout, hidden, size) => {
    if (!layout) return 0;
    const total = size * size;
    if (hidden > 0) return hidden / total;
    const area = layout.shape === 'circle' ? (Math.PI / 4) * layout.box ** 2 : layout.box ** 2;
    return area / total;
};

export const renderQr = (text, rawStyle) => {
    if (!text) return { ok: false, error: 'empty' };

    const style = normalizeStyle(rawStyle);
    const matrix = buildMatrix(text, getLevels(style));
    if (!matrix) return { ok: false, error: 'too-long' };

    const { size } = matrix;
    const total = size + style.margin * 2;
    const layout = getLogoLayout(style, size);
    const { path: modulesPath, hidden } = buildModules(style, matrix, layout);
    const { frames, balls } = buildEyes(style, size);
    const logo = buildLogo(style, layout);

    const ink = style.fgMode === 'solid' ? style.fg : 'url(#qf)';
    const frameInk = style.eyeColorMode === 'custom' ? style.eyeFrameColor : ink;
    const ballInk = style.eyeColorMode === 'custom' ? style.eyeBallColor : ink;
    const crisp = style.pixel === 'square' && style.pixelScale === 1 ? ' shape-rendering="crispEdges"' : '';
    const background = style.bgTransparent
        ? ''
        : `<rect width="${total}" height="${total}" rx="${f((total * style.bgRadius) / 100)}" fill="${style.bg}"/>`;

    const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${EXPORT_SIZE}" height="${EXPORT_SIZE}">`,
        `<defs>${buildGradient(style, total)}${logo.defs}</defs>`,
        background,
        `<path d="${modulesPath}" fill="${ink}"${crisp}/>`,
        `<path d="${frames}" fill="${frameInk}" fill-rule="evenodd"/>`,
        `<path d="${balls}" fill="${ballInk}"/>`,
        logo.body,
        '</svg>',
    ].join('');

    const stats = {
        ecc: matrix.ecc,
        size,
        hidden,
        covered: getCovered(layout, hidden, size),
        logoCoversEyes: layout ? coversEyes(layout, size, style.margin) : false,
    };

    return { ok: true, svg, ecc: matrix.ecc, size, guards: getGuards(style, stats) };
};

export const toDataUrl = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
