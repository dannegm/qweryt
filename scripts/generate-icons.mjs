import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildSvg } from './icon-svg.mjs';

const dir = mkdtempSync(join(tmpdir(), 'qweryt-icons-'));
const render = (name, options, output, px) => {
    const source = join(dir, `${name}.svg`);
    writeFileSync(source, buildSvg(options));
    execFileSync('rsvg-convert', ['-w', px, '-h', px, source, '-o', output]);
    execFileSync('magick', [output, ...(options.radius ? [] : ['-alpha', 'off']), output]);
};

writeFileSync('public/favicon.svg', buildSvg({ size: 32, radius: 8, glyph: 0.66 }));
render('apple', { size: 512, radius: 0, glyph: 0.56 }, 'public/apple-touch-icon.png', 180);
render('maskable', { size: 512, radius: 0, glyph: 0.5 }, 'public/icons/icon-maskable-512.png', 512);
render('any', { size: 512, radius: 112, glyph: 0.58 }, 'public/icons/icon-512.png', 512);
render('any', { size: 512, radius: 112, glyph: 0.58 }, 'public/icons/icon-192.png', 192);
