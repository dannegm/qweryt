import { EXPORT_SIZE, toDataUrl } from './render';

export const EXPORT_FORMATS = ['png', 'jpg', 'svg'];

const MIME = { png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml' };

const loadImage = src =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Image failed to load'));
        image.src = src;
    });

const rasterize = async (svg, format) => {
    const image = await loadImage(toDataUrl(svg));
    const canvas = document.createElement('canvas');
    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;
    const context = canvas.getContext('2d');
    if (format === 'jpg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
    }
    context.drawImage(image, 0, 0, EXPORT_SIZE, EXPORT_SIZE);
    return new Promise((resolve, reject) =>
        canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Export failed'))), MIME[format], 0.95),
    );
};

export const exportQr = async (svg, format) => {
    if (format === 'svg') return new Blob([svg], { type: MIME.svg });
    return rasterize(svg, format);
};

export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
