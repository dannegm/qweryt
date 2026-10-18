import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/ui/button';
import { EXPORT_FORMATS, downloadBlob, exportQr } from '@/engine/export';

export const ExportButtons = ({ svg, filename, disabled }) => {
    const { t } = useTranslation();
    const [busy, setBusy] = useState(null);

    const handleExport = async format => {
        setBusy(format);
        try {
            const blob = await exportQr(svg, format);
            downloadBlob(blob, `${filename}.${format}`);
        } catch {
            toast.error(t('editor.exportError'));
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className='grid grid-cols-3 gap-2'>
            {EXPORT_FORMATS.map(format => (
                <Button
                    key={format}
                    variant='outline'
                    className='h-11 bg-card'
                    disabled={disabled || busy !== null}
                    onClick={() => handleExport(format)}
                >
                    <Download />
                    {t(`editor.exportFormats.${format}`)}
                </Button>
            ))}
        </div>
    );
};
