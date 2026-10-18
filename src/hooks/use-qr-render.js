import { useMemo } from 'react';
import { encodeContent, isContentPreviewable } from '@/content-types';
import { renderQr, toDataUrl } from '@/engine/render';

export const SAMPLE_TEXT = 'https://qweryt.hckr.mx';

export const useQrRender = ({ type, content, style, allowSample = false }) =>
    useMemo(() => {
        const previewable = isContentPreviewable(type, content);
        if (!previewable && !allowSample) return { ok: false, error: 'empty', sample: false };
        const text = previewable ? encodeContent(type, content) : SAMPLE_TEXT;
        const result = renderQr(text, style);
        return { ...result, url: result.ok ? toDataUrl(result.svg) : null, sample: !previewable };
    }, [type, content, style, allowSample]);
