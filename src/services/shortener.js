const SHORTENER_URL = import.meta.env.VITE_SHORTENER_URL || 'https://s.hckr.mx';

export const shorten = async (url, { signal } = {}) => {
    const response = await fetch(`${SHORTENER_URL}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal,
    });
    if (!response.ok) throw new Error('Shortener request failed');
    const data = await response.json();
    if (!data?.short) throw new Error('Shortener returned no link');
    return data.short;
};
