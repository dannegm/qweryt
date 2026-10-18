import { supabase } from '@/helpers/supabase';

export const syncProfile = async user => {
    const { error } = await supabase()
        .from('profiles')
        .upsert({ id: user.id, name: user.name, color: user.color, updated_at: new Date().toISOString() });
    if (error) throw error;
};

export const updateProfileMutation = (opts = {}) => ({
    mutationFn: async user => {
        await syncProfile(user);
        return user;
    },
    ...opts,
});
