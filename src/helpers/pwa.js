export const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export const isIphonePwa = () => /iphone|ipod/i.test(navigator.userAgent) && isStandalone();

export const registerServiceWorker = () => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

    let hasController = !!navigator.serviceWorker.controller;
    let isReloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hasController) {
            hasController = true;
            return;
        }
        if (isReloading) return;
        isReloading = true;
        window.location.reload();
    });

    window.addEventListener('load', async () => {
        const registration = await navigator.serviceWorker.register('/sw.js');
        navigator.storage?.persist?.();

        const applyUpdate = () => {
            if (registration.waiting && navigator.serviceWorker.controller) {
                registration.waiting.postMessage('skip-waiting');
            }
        };
        applyUpdate();

        const checkForUpdate = async () => {
            try {
                await registration.update();
            } catch {}
        };
        window.addEventListener('online', checkForUpdate);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') return;
            applyUpdate();
            checkForUpdate();
        });
    });
};
