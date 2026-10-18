import { useRef, useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ContentTab } from '@/components/editor/content-tab';
import { CustomizeTab } from '@/components/editor/customize-tab';
import { EditorPreview } from '@/components/editor/editor-preview';
import { GuardsList } from '@/components/editor/guards-list';
import { SettingsTab } from '@/components/editor/settings-tab';
import { Button } from '@/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { getContentType, isContentValid, mergeValues, updateValues } from '@/content-types';
import { useIdentity } from '@/hooks/use-identity';
import { useQrRender } from '@/hooks/use-qr-render';
import { resolveTitle } from '@/helpers/qr';
import { createQrMutation, updateQrMutation } from '@/queries/qrs';
import { randomCardColor, randomizeStyle } from '@/style-options';

const TABS = ['content', 'customize', 'settings'];

const PAGE_TITLES = { create: 'editor.newTitle', edit: 'editor.editTitle', duplicate: 'editor.duplicateTitle' };
const SAVE_LABELS = { create: 'editor.saveNew', edit: 'editor.saveEdit', duplicate: 'editor.saveCopy' };

export const QrEditor = ({ mode, initialDraft, qr }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useIdentity();
    const [draft, setDraft] = useState(initialDraft);
    const [tab, setTab] = useState('content');
    const $memory = useRef({ [initialDraft.type]: initialDraft.content });

    const render = useQrRender({
        type: draft.type,
        content: draft.content,
        style: draft.style,
        allowSample: true,
    });
    const valid = isContentValid(draft.type, draft.content);
    const resolvedTitle = resolveTitle(draft, t);

    const handleSaved = (saved, message) => {
        queryClient.invalidateQueries({ queryKey: ['qrs'] });
        toast.success(message);
        navigate({ to: '/q/$id', params: { id: saved.id } });
    };

    const create = useMutation(
        createQrMutation({
            onSuccess: saved => handleSaved(saved, t('editor.saved')),
            onError: () => toast.error(t('editor.saveError')),
        }),
    );
    const update = useMutation(
        updateQrMutation({
            onSuccess: saved => handleSaved(saved, t('editor.updated')),
            onError: () => toast.error(t('editor.saveError')),
        }),
    );
    const pending = create.isPending || update.isPending;

    const handleTypeChange = typeId => {
        $memory.current[draft.type] = draft.content;
        const type = getContentType(typeId);
        setDraft(current => ({ ...current, type: typeId, content: $memory.current[typeId] ?? type.initial() }));
    };

    const handleContentChange = patch =>
        setDraft(current => {
            const type = getContentType(current.type);
            return { ...current, content: updateValues(type, mergeValues(type, current.content), patch) };
        });

    const handleStyleChange = updater => setDraft(current => ({ ...current, style: updater(current.style) }));

    const handleRandomize = () =>
        setDraft(current => ({ ...current, style: randomizeStyle(current.style), cardColor: randomCardColor() }));

    const handleSave = () => {
        if (mode === 'edit') update.mutate({ id: qr.id, profileId: user.id, draft });
        else create.mutate({ profile: user, draft });
    };

    return (
        <div className='pb-32'>
            <h2 className='mb-4 text-2xl font-bold tracking-tight'>{t(PAGE_TITLES[mode])}</h2>
            <div className='grid gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10'>
                <div className='sticky top-[calc(3rem+env(safe-area-inset-top))] z-10 -mx-4 flex flex-col gap-3 bg-background px-4 py-2 lg:top-20 lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0'>
                    <EditorPreview
                        typeId={draft.type}
                        cardColor={draft.cardColor}
                        title={resolvedTitle}
                        render={render}
                        onRandomize={handleRandomize}
                    />
                    <GuardsList guards={render.guards} className='hidden lg:flex' />
                    {render.sample && (
                        <p className='hidden text-xs text-muted-foreground lg:block'>{t('editor.sampleHint')}</p>
                    )}
                </div>
                <Tabs value={tab} onValueChange={setTab} className='gap-5'>
                    <TabsList className='h-11 w-full'>
                        {TABS.map(item => (
                            <TabsTrigger key={item} value={item} className='text-sm'>
                                {t(`editor.tabs.${item}`)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value='content'>
                        <ContentTab
                            typeId={draft.type}
                            content={draft.content}
                            onTypeChange={handleTypeChange}
                            onContentChange={handleContentChange}
                        />
                    </TabsContent>
                    <TabsContent value='customize'>
                        <CustomizeTab style={draft.style} guards={render.guards} onStyleChange={handleStyleChange} />
                    </TabsContent>
                    <TabsContent value='settings'>
                        <SettingsTab
                            draft={draft}
                            render={render}
                            resolvedTitle={resolvedTitle}
                            onTitleChange={title => setDraft(current => ({ ...current, title }))}
                            onCardColorChange={cardColor => setDraft(current => ({ ...current, cardColor }))}
                        />
                    </TabsContent>
                </Tabs>
            </div>
            <div className='pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur'>
                <div className='mx-auto flex w-full max-w-lg flex-col gap-2 px-4 py-3 sm:max-w-3xl lg:max-w-6xl'>
                    {!valid && <p className='text-xs text-muted-foreground'>{t('editor.incomplete')}</p>}
                    <div className='flex gap-2'>
                        <Button variant='outline' className='h-11' onClick={() => router.history.back()}>
                            {t('common.cancel')}
                        </Button>
                        <Button className='h-11 flex-1' disabled={!valid || pending} onClick={handleSave}>
                            {t(SAVE_LABELS[mode])}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
