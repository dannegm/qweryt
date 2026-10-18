import { Avatar } from '@dicebear/core';
import shapeGrid from '@dicebear/styles/shape-grid.json';
import Color from 'color';

const cache = new Map();

const toHex = color => {
    try {
        return Color(color).hex();
    } catch {
        return null;
    }
};

export const getAvatarUrl = (seed, color) => {
    if (!seed) return '';
    const hex = color ? toHex(color) : null;
    const key = `${seed}|${hex}`;
    if (!cache.has(key)) {
        const options = hex ? { seed, backgroundColor: [hex] } : { seed };
        cache.set(key, new Avatar(shapeGrid, options).toDataUri());
    }
    return cache.get(key);
};
