const f = number => +number.toFixed(3);

export const roundRect = (x, y, width, height, radii) => {
    const max = Math.min(width, height) / 2;
    const [tl, tr, br, bl] = radii.map(radius => Math.min(radius, max));
    const arc = (radius, toX, toY) => (radius ? `A${f(radius)} ${f(radius)} 0 0 1 ${f(toX)} ${f(toY)}` : '');
    return [
        `M${f(x + tl)} ${f(y)}`,
        `H${f(x + width - tr)}`,
        arc(tr, x + width, y + tr),
        `V${f(y + height - br)}`,
        arc(br, x + width - br, y + height),
        `H${f(x + bl)}`,
        arc(bl, x, y + height - bl),
        `V${f(y + tl)}`,
        arc(tl, x + tl, y),
        'Z',
    ].join('');
};

export const circle = (cx, cy, radius) =>
    `M${f(cx - radius)} ${f(cy)}a${f(radius)} ${f(radius)} 0 1 0 ${f(radius * 2)} 0a${f(radius)} ${f(radius)} 0 1 0 ${f(-radius * 2)} 0Z`;

export const diamond = (cx, cy, radius) =>
    `M${f(cx)} ${f(cy - radius)}L${f(cx + radius)} ${f(cy)}L${f(cx)} ${f(cy + radius)}L${f(cx - radius)} ${f(cy)}Z`;

export const sparkle = (cx, cy, radius) =>
    `M${f(cx)} ${f(cy - radius)}Q${f(cx)} ${f(cy)} ${f(cx + radius)} ${f(cy)}Q${f(cx)} ${f(cy)} ${f(cx)} ${f(cy + radius)}Q${f(cx)} ${f(cy)} ${f(cx - radius)} ${f(cy)}Q${f(cx)} ${f(cy)} ${f(cx)} ${f(cy - radius)}Z`;

const SQUARE = [0, 0, 0, 0];

const sharpRadii = (radius, sharp) => [0, 1, 2, 3].map(index => (index === sharp ? 0 : radius));

export const modulePath = (kind, x, y, scale, near) => {
    const inset = (1 - scale) / 2;
    const cx = x + 0.5;
    const cy = y + 0.5;

    if (kind === 'rounded') {
        return roundRect(x + inset, y + inset, scale, scale, Array(4).fill(scale * 0.3));
    }
    if (kind === 'liquid') {
        const x0 = x + (near.l ? 0 : inset);
        const x1 = x + 1 - (near.r ? 0 : inset);
        const y0 = y + (near.u ? 0 : inset);
        const y1 = y + 1 - (near.d ? 0 : inset);
        const radius = scale / 2;
        return roundRect(x0, y0, x1 - x0, y1 - y0, [
            near.u || near.l ? 0 : radius,
            near.u || near.r ? 0 : radius,
            near.d || near.r ? 0 : radius,
            near.d || near.l ? 0 : radius,
        ]);
    }
    if (kind === 'dots') return circle(cx, cy, scale / 2);
    if (kind === 'diamond') return diamond(cx, cy, scale * 0.55);
    if (kind === 'star') return sparkle(cx, cy, scale * 0.62);
    if (kind === 'bars-v') {
        const width = scale * 0.6;
        const y0 = y + (near.u ? 0 : inset);
        const y1 = y + 1 - (near.d ? 0 : inset);
        const radius = width / 2;
        return roundRect(cx - width / 2, y0, width, y1 - y0, [
            near.u ? 0 : radius,
            near.u ? 0 : radius,
            near.d ? 0 : radius,
            near.d ? 0 : radius,
        ]);
    }
    if (kind === 'bars-h') {
        const height = scale * 0.6;
        const x0 = x + (near.l ? 0 : inset);
        const x1 = x + 1 - (near.r ? 0 : inset);
        const radius = height / 2;
        return roundRect(x0, cy - height / 2, x1 - x0, height, [
            near.l ? 0 : radius,
            near.r ? 0 : radius,
            near.r ? 0 : radius,
            near.l ? 0 : radius,
        ]);
    }
    return roundRect(x + inset, y + inset, scale, scale, SQUARE);
};

export const eyeFramePath = (kind, ox, oy, sharp) => {
    const cx = ox + 3.5;
    const cy = oy + 3.5;
    if (kind === 'circle') return circle(cx, cy, 3.5) + circle(cx, cy, 2.5);
    const [outer, inner] = {
        rounded: [Array(4).fill(2), Array(4).fill(1.2)],
        leaf: [sharpRadii(3, sharp), sharpRadii(2, sharp)],
    }[kind] ?? [SQUARE, SQUARE];
    return roundRect(ox, oy, 7, 7, outer) + roundRect(ox + 1, oy + 1, 5, 5, inner);
};

export const eyeBallPath = (kind, ox, oy, sharp) => {
    const cx = ox + 3.5;
    const cy = oy + 3.5;
    if (kind === 'circle') return circle(cx, cy, 1.5);
    if (kind === 'diamond') return diamond(cx, cy, 1.9);
    const radii = {
        rounded: Array(4).fill(0.8),
        leaf: sharpRadii(1.5, sharp),
    }[kind] ?? SQUARE;
    return roundRect(ox + 2, oy + 2, 3, 3, radii);
};
