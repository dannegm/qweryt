import Color from 'color';
import { nanoid } from 'nanoid';
import { ADJECTIVES, ANIMALS } from '@/constants/word-lists';
import { settings } from '@/helpers/settings';

const pick = list => list[Math.floor(Math.random() * list.length)];

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

export const generateName = () => [pick(ANIMALS), pick(ADJECTIVES)].map(capitalize).join(' ');

export const generateColor = () => Color.hsl(Math.floor(Math.random() * 360), 70, 70).hex();

export const ensureIdentity = () => {
    if (settings.get('user')?.id) return;
    settings.set('user', { id: nanoid(10), name: generateName(), color: generateColor() });
};
