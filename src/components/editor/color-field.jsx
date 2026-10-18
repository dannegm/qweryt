import { ColorPicker } from '@/ui/color-picker';
import { Label } from '@/ui/label';

export const ColorField = ({ label, value, onChange }) => (
    <div className='flex items-center justify-between gap-3'>
        <Label>{label}</Label>
        <ColorPicker value={value} onChange={onChange} title={label}>
            <button
                type='button'
                className='flex h-10 items-center gap-2.5 rounded-lg border border-border bg-card pr-3 pl-2'
            >
                <span className='size-6 rounded-md border border-border bg-(--swatch)' style={{ '--swatch': value }} />
                <span className='font-mono text-xs uppercase'>{value}</span>
            </button>
        </ColorPicker>
    </div>
);
