import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const EXCLUDE = [/^sw\.js$/, /\.map$/, /(^|\/)\.DS_Store$/, /^splash\//];

const listFiles = dir =>
    readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
        entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
    );

// Fills `public/sw.js` after the build with every emitted file (JS/CSS chunks, fonts, the map
// SVGs, icons…) and a content hash as cache version, so the service worker precaches the whole
// app in one atomic install and a new build always produces a new worker.
export const precachePlugin = () => {
    let outDir;
    return {
        name: 'qweryt-precache',
        apply: 'build',
        configResolved(config) {
            outDir = join(config.root, config.build.outDir);
        },
        closeBundle() {
            const swPath = join(outDir, 'sw.js');
            if (!existsSync(swPath)) {
                this.warn('sw.js not found in the output, precache skipped');
                return;
            }
            const files = listFiles(outDir)
                .map(file => relative(outDir, file).split(sep).join('/'))
                .filter(file => !EXCLUDE.some(pattern => pattern.test(file)))
                .sort();
            const hash = createHash('sha256');
            files.forEach(file => hash.update(file).update(readFileSync(join(outDir, file))));
            const urls = files.map(file => (file === 'index.html' ? '/' : `/${file}`));
            const source = readFileSync(swPath, 'utf8')
                .replace("'__BUILD_VERSION__'", JSON.stringify(hash.digest('hex').slice(0, 10)))
                .replace('[/*__PRECACHE__*/]', JSON.stringify(urls));
            writeFileSync(swPath, source);
        },
    };
};
