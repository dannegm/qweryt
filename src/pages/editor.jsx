import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { QrEditor } from '@/components/editor/qr-editor';
import { NotOwner, QrLoadError, QrLoading, QrNotFound } from '@/components/qr/qr-states';
import { useIdentity } from '@/hooks/use-identity';
import { createDraft, isOwner, qrToDraft } from '@/helpers/qr';
import { qrQuery } from '@/queries/qrs';

export const NewQrPage = () => {
    const [draft] = useState(createDraft);
    return <QrEditor mode='create' initialDraft={draft} />;
};

const ExistingQrEditor = ({ mode }) => {
    const { id } = useParams({ strict: false });
    const { user } = useIdentity();
    const { data: qr, isPending, isError, refetch } = useQuery(qrQuery(id));

    if (isPending) return <QrLoading />;
    if (isError) return <QrLoadError onRetry={refetch} />;
    if (!qr) return <QrNotFound />;
    if (mode === 'edit' && !isOwner(qr, user)) return <NotOwner id={qr.id} />;

    return <QrEditor key={`${mode}.${qr.id}`} mode={mode} qr={qr} initialDraft={qrToDraft(qr)} />;
};

export const EditQrPage = () => <ExistingQrEditor mode='edit' />;

export const DuplicateQrPage = () => <ExistingQrEditor mode='duplicate' />;
