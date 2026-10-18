import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildTile } from './icon-svg.mjs';

const BACKGROUND = '#f6f6fb';
const TILE_PT = 96;
const TILE = { size: 512, radius: 154, glyph: 0.56 };

// iPhone portrait sizes in points (+ pixel ratio). iOS only picks a startup image whose media
// query matches the device exactly, otherwise it shows a blank screen while the PWA boots.
const DEVICES = [
    [440, 956, 3],
    [420, 912, 3],
    [430, 932, 3],
    [402, 874, 3],
    [393, 852, 3],
    [390, 844, 3],
    [414, 896, 3],
    [375, 812, 3],
    [414, 896, 2],
    [414, 736, 3],
    [375, 667, 2],
    [320, 568, 2],
];

const buildSplash = (width, height, dpr) => {
    const tile = TILE_PT * dpr;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${BACKGROUND}"/><svg x="${(width - tile) / 2}" y="${(height - tile) / 2}" width="${tile}" height="${tile}" viewBox="0 0 512 512">${buildTile(TILE)}</svg></svg>`;
};

const dir = mkdtempSync(join(tmpdir(), 'qweryt-splash-'));
mkdirSync('public/splash', { recursive: true });

const links = DEVICES.map(([w, h, dpr]) => {
    const name = `splash-${w * dpr}x${h * dpr}.png`;
    const source = join(dir, `${name}.svg`);
    writeFileSync(source, buildSplash(w * dpr, h * dpr, dpr));
    execFileSync('rsvg-convert', [source, '-o', `public/splash/${name}`]);
    execFileSync('magick', [`public/splash/${name}`, '-alpha', 'off', `public/splash/${name}`]);
    const media = `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`;
    return `        <link rel="apple-touch-startup-image" media="${media}" href="/splash/${name}" />`;
});

const boot = `<div class="boot"><svg xmlns="http://www.w3.org/2000/svg" width="${TILE_PT}" height="${TILE_PT}" viewBox="0 0 512 512">${buildTile(TILE)}</svg></div>`;

const replaceBetween = (html, name, content) =>
    html.replace(new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`), `$1\n${content}\n        $2`);

let html = readFileSync('index.html', 'utf8');
html = replaceBetween(html, 'splash', links.join('\n'));
html = replaceBetween(html, 'boot', `            ${boot}`);
writeFileSync('index.html', html);
