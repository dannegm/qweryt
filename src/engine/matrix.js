import qrcode from 'qrcode-generator';

const encoder = new TextEncoder();

qrcode.stringToBytes = text => Array.from(encoder.encode(text));

const tryLevel = (text, level) => {
    try {
        const qr = qrcode(0, level);
        qr.addData(text, 'Byte');
        qr.make();
        return qr;
    } catch {
        return null;
    }
};

export const buildMatrix = (text, levels) => {
    for (const level of levels) {
        const qr = tryLevel(text, level);
        if (!qr) continue;
        const size = qr.getModuleCount();
        const modules = Array.from({ length: size }, (_, row) =>
            Uint8Array.from({ length: size }, (_, col) => (qr.isDark(row, col) ? 1 : 0)),
        );
        return { size, modules, ecc: level };
    }
    return null;
};
