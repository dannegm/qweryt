const SIZES = [192, 128, 96, 64];
const MAX_LENGTH = 100000;

const loadImage = src =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Image failed to load'));
        image.src = src;
    });

const draw = (image, max) => {
    const width = image.naturalWidth || max;
    const height = image.naturalHeight || max;
    const scale = Math.min(1, max / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
};

export const readLogoFile = async file => {
    if (!file.type.startsWith('image/')) throw new Error('Not an image');
    const objectUrl = URL.createObjectURL(file);
    try {
        const image = await loadImage(objectUrl);
        for (const size of SIZES) {
            const result = draw(image, size);
            if (result.length <= MAX_LENGTH) return result;
        }
        throw new Error('Image is too detailed');
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
};
