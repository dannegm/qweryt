import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js';
import { QrCard } from '@/components/qr/qr-card';
import { QrCardActions } from '@/components/qr/qr-card-actions';
import { encodeContent } from '@/content-types';
import { getQrTitle, getSummaryLines } from '@/helpers/qr';

const buildDocs = (qrs, t) =>
    qrs.map(qr => ({
        id: qr.id,
        title: getQrTitle(qr, t),
        type: t(`types.${qr.type}.label`),
        text: encodeContent(qr.type, qr.content),
        lines: getSummaryLines(qr, t).map(line => line.value),
    }));

export const useFilteredQrs = (qrs, query) => {
    const { t } = useTranslation();
    const fuse = useMemo(
        () =>
            new Fuse(buildDocs(qrs, t), {
                keys: ['title', 'type', 'text', 'lines'],
                threshold: 0.35,
                ignoreLocation: true,
                ignoreDiacritics: true,
            }),
        [qrs, t],
    );

    return useMemo(() => {
        const term = query.trim();
        if (!term) return qrs;
        const ids = new Set(fuse.search(term).map(result => result.item.id));
        return qrs.filter(qr => ids.has(qr.id));
    }, [qrs, query, fuse]);
};

export const QrLibrary = ({ qrs, user }) => {
    const [selectedId, setSelectedId] = useState(qrs[0]?.id ?? null);

    useEffect(() => {
        if (!qrs.some(qr => qr.id === selectedId)) setSelectedId(qrs[0]?.id ?? null);
    }, [qrs, selectedId]);

    return (
        <div className='flex flex-col sm:grid sm:grid-cols-2 sm:items-start sm:gap-5 lg:grid-cols-3'>
            {qrs.map(qr => (
                <QrCard
                    key={qr.id}
                    qr={qr}
                    collapsible
                    collapsed={qr.id !== selectedId}
                    onSelect={() => setSelectedId(qr.id)}
                    isMine
                    actions={<QrCardActions qr={qr} isMine profileId={user.id} />}
                />
            ))}
        </div>
    );
};
