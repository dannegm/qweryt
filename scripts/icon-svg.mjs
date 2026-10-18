const QR_CODE = [
    '<rect width="5" height="5" x="3" y="3" rx="1"/>',
    '<rect width="5" height="5" x="16" y="3" rx="1"/>',
    '<rect width="5" height="5" x="3" y="16" rx="1"/>',
    '<path d="M21 16h-3a2 2 0 0 0-2 2v3"/>',
    '<path d="M21 21v.01"/>',
    '<path d="M12 7v3a2 2 0 0 1-2 2H7"/>',
    '<path d="M3 12h.01"/>',
    '<path d="M12 3h.01"/>',
    '<path d="M12 16v.01"/>',
    '<path d="M16 12h1"/>',
    '<path d="M21 12v.01"/>',
    '<path d="M12 21v-1"/>',
].join('');

export const buildTile = ({ size, radius, glyph }) => {
    const scale = (size * glyph) / 24;
    return `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#818cf8"/><stop offset="1" stop-color="#4f46e5"/></linearGradient></defs><rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/><g transform="translate(${size / 2} ${size / 2}) scale(${scale}) translate(-12 -12)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${QR_CODE}</g>`;
};

export const buildSvg = options =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${options.size} ${options.size}">${buildTile(options)}</svg>`;
