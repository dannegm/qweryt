import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/ui/button';
import { readLogoFile } from '@/helpers/logo';
import { attachLogo, removeLogo } from '@/style-options';

export const LogoUpload = ({ logo, onChange }) => {
    const { t } = useTranslation();
    const $input = useRef(null);

    const handleFile = async event => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
            const src = await readLogoFile(file);
            onChange(style => attachLogo(style, src));
        } catch {
            toast.error(t('style.logo.error'));
        }
    };

    return (
        <div className='flex items-center gap-3'>
            <input ref={$input} type='file' accept='image/*' className='hidden' onChange={handleFile} />
            {logo?.src ? (
                <>
                    <img
                        src={logo.src}
                        alt=''
                        className='size-14 shrink-0 rounded-xl border border-border bg-card object-contain p-1'
                    />
                    <div className='flex flex-1 flex-wrap gap-2'>
                        <Button variant='outline' className='h-10' onClick={() => $input.current?.click()}>
                            <ImagePlus />
                            {t('style.logo.replace')}
                        </Button>
                        <Button variant='destructive' className='h-10' onClick={() => onChange(removeLogo)}>
                            <Trash2 />
                            {t('style.logo.remove')}
                        </Button>
                    </div>
                </>
            ) : (
                <Button
                    variant='outline'
                    className='h-14 flex-1 border-dashed [&>svg]:size-5'
                    onClick={() => $input.current?.click()}
                >
                    <ImagePlus />
                    {t('style.logo.upload')}
                </Button>
            )}
        </div>
    );
};
