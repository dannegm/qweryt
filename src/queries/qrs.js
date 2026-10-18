import { nanoid } from 'nanoid';
import { cache } from '@/helpers/cache';
import { supabase } from '@/helpers/supabase';
import { syncProfile } from '@/queries/profiles';

const cacheKey = profileId => `qrs:${profileId}`;

export const qrsQuery = (profileId, opts = {}) => ({
    queryKey: ['qrs', 'mine', profileId],
    queryFn: async () => {
        const { data, error } = await supabase()
            .from('qrs')
            .select('*')
            .eq('profile_id', profileId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        cache.set(cacheKey(profileId), data);
        return data;
    },
    initialData: () => cache.get(cacheKey(profileId)) ?? undefined,
    initialDataUpdatedAt: 0,
    ...opts,
});

export const qrQuery = (id, opts = {}) => ({
    queryKey: ['qrs', 'one', id],
    queryFn: async () => {
        const { data, error } = await supabase()
            .from('qrs')
            .select('*, profile:profiles(id, name, color)')
            .eq('id', id)
            .maybeSingle();
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const createQrMutation = (opts = {}) => ({
    mutationFn: async ({ profile, draft }) => {
        await syncProfile(profile);
        const { data, error } = await supabase()
            .from('qrs')
            .insert({
                id: nanoid(8),
                profile_id: profile.id,
                title: draft.title,
                type: draft.type,
                content: draft.content,
                style: draft.style,
                card_color: draft.cardColor,
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const updateQrMutation = (opts = {}) => ({
    mutationFn: async ({ id, profileId, draft }) => {
        const { data, error } = await supabase()
            .from('qrs')
            .update({
                title: draft.title,
                type: draft.type,
                content: draft.content,
                style: draft.style,
                card_color: draft.cardColor,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('profile_id', profileId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    ...opts,
});

export const deleteQrMutation = (opts = {}) => ({
    mutationFn: async ({ id, profileId }) => {
        const { error } = await supabase().from('qrs').delete().eq('id', id).eq('profile_id', profileId);
        if (error) throw error;
        return id;
    },
    ...opts,
});
