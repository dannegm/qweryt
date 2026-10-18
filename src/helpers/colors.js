import { luminance } from '@/engine/style';

export const hslToHex = (hue, saturation, lightness) => {
    const s = saturation / 100;
    const l = lightness / 100;
    const k = n => (n + hue / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const channel = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return `#${[0, 8, 4].map(n => Math.round(channel(n) * 255).toString(16).padStart(2, '0')).join('')}`;
};

export const getCardForeground = color => (luminance(color) > 0.42 ? '#14142b' : '#ffffff');
